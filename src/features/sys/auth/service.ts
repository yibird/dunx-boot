import { UnauthorizedError } from '@/errors'
import { AppConfigService } from '@/infra/config'
import { Api } from '@/infra/model'
import {
  AssertUtils,
  AvatarUtils,
  CaptchaUtils,
  IdUtils,
  PasswordUtils,
  TokenUtils,
  WebUtils,
} from '@/utils'
import {
  REDIS_KEY_PREFIX,
  REDIS_KEY_TTL,
  SYS_CAPTCHA_TYPE,
  SYS_LOGIN_PLATFORM,
  SYS_LOGIN_TYPE,
  type SysLoginPlatform,
} from '@/constants'
import { SysAuthRepository, type SysUserRow } from './repository'
import { SysRoleRepository } from '../role/repository'
import type {
  SysAuthAccountLoginReq,
  SysAuthAccountRegisterReq,
  SysAuthEmailRegisterReq,
  SysAuthPhoneLoginReq,
  SysAuthPhoneRegisterReq,
} from './schema'
import { RedisConnection } from '@dunx/infra/redis'
import { EventBus } from '@dunx/core'
import { SysCaptchaLogEvent, SysLoginLogEvent } from '@/events'
import { SysUserRepository } from '../user/repository'
import type { SysLoginLogEventPayload } from '@/events'
import type { SessionContext } from '@/infra/context'

/**
 * 认证业务层
 */
export class SysAuthService {
  constructor(
    private readonly config: AppConfigService,
    private readonly redis: RedisConnection,
    private readonly eventBus: EventBus,

    private readonly authRepository: SysAuthRepository,
    private readonly roleRepository: SysRoleRepository,
    private readonly userRepository: SysUserRepository
  ) {
    TokenUtils.setConfig(config)
  }

  /**
   * 校验图片验证码
   *
   * @param captchaId 验证码id
   * @param input 验证码输入
   * @returns 是否校验通过
   */
  async #verifyImageCaptcha(captchaId: string, inputCaptcha: string) {
    const key = REDIS_KEY_PREFIX.ImageCaptcha(captchaId)
    const captcha = await this.redis.get(key)
    return captcha === inputCaptcha
  }

  /**
   * 校验短信验证码
   *
   * @param captchaId 验证码id
   * @param input 验证码输入
   * @returns 是否校验通过
   */
  async #verifySmsCaptcha(captchaId: string, inputCaptcha: string) {
    const key = REDIS_KEY_PREFIX.SmsCaptcha(captchaId)
    const captcha = await this.redis.get(key)
    return captcha === inputCaptcha
  }

  async #issue(user: SysUserRow) {
    // 1.查询角色权限
    const permissions = await this.roleRepository.getPermissions(user.roleId)
    // 2.签发令牌
    const { accessToken, refreshToken } = await TokenUtils.issue({
      id: user.id,
      account: user.account,
      // 平台级账号没有租户，令牌里省掉该声明而不是写 null。
      tenantId: user.tenantId ?? undefined,
      roleId: user.roleId,
      permissions,
    })
    // 3.redis存储令牌
    const accessTokenKey = REDIS_KEY_PREFIX.AccountToken(accessToken)
    const refreshTokenKey = REDIS_KEY_PREFIX.RefreshToken(refreshToken)
    const { accessTtl, refreshTtl } = TokenUtils.getConfig()
    const [accessTokenRes, refreshTokenRes] = await Promise.all([
      this.redis.set(accessTokenKey, accessToken, {
        ex: accessTtl,
      }),
      this.redis.set(refreshTokenKey, refreshToken, {
        ex: refreshTtl,
      }),
    ])
    AssertUtils.notNull(accessTokenRes || refreshTokenRes, '登录失败')
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer' as const,
      user: {
        id: user.id,
        account: user.account,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        tenantId: user.tenantId,
        roleId: user.roleId,
      },
    }
  }

  /**
   * 写入登录日志
   *
   * @param req 请求对象
   * @param payload 载荷
   */
  async #withLoginLog(payload: SysLoginLogEventPayload, req: Bun.BunRequest) {
    this.eventBus.emit(new SysLoginLogEvent({ ...payload }, req))
  }

  /**
   * 生成图形验证码
   *
   * @param req 请求对象，供验证码日志记录来源
   * @returns 图形验证码对象
   */
  async createImageCaptcha(req: Bun.BunRequest) {
    // 1.生成图形验证码
    const { text, dataUrl } = await CaptchaUtils.generate()
    const captchaId = IdUtils.shortId()

    // 2.redis存储验证码
    const key = REDIS_KEY_PREFIX.ImageCaptcha(captchaId)
    await this.redis.set(key, text, {
      ex: REDIS_KEY_TTL.ImageCaptcha,
    })

    // 3.异步插入验证码日志（验证码本身是凭据，不随事件传递）
    this.eventBus.emit(
      new SysCaptchaLogEvent(
        {
          captchaId,
          captchaType: SYS_CAPTCHA_TYPE.Image,
          ttl: REDIS_KEY_TTL.ImageCaptcha,
        },
        req
      )
    )
    return { captchaId, captcha: dataUrl }
  }

  /**
   * 发送短信验证码：写入 redis 供校验，并发事件记录一条验证码日志。
   *
   * @param phone 手机号
   * @param req 请求对象，供验证码日志记录来源
   * @returns 短信验证码对象
   */
  async smsCaptcha(phone: string, req: Bun.BunRequest) {
    const code = CaptchaUtils.randomText(6, '0123456789')
    const captchaId = IdUtils.shortId()
    const key = REDIS_KEY_PREFIX.SmsCaptcha(captchaId)
    await this.redis.set(key, code, {
      ex: REDIS_KEY_TTL.SmsCaptcha,
    })

    this.eventBus.emit(
      new SysCaptchaLogEvent(
        {
          captchaId,
          captchaType: SYS_CAPTCHA_TYPE.Sms,
          target: phone,
          ttl: REDIS_KEY_TTL.SmsCaptcha,
        },
        req
      )
    )
    return {
      captchaId,
      expiresIn: REDIS_KEY_TTL.SmsCaptcha,
    }
  }

  /**
   * 账号密码注册
   *
   * @param input 注册参数
   * @returns 注册结果
   */
  async accountRegister(input: SysAuthAccountRegisterReq) {
    // 1.校验验证码
    const valid = await this.#verifyImageCaptcha(input.captchaId, input.captcha)
    AssertUtils.isTrue(valid, '验证码错误')

    // 2.校验账号和手机号是否已存在
    const user = await this.userRepository.findByAccount(input.account)
    AssertUtils.isNull(user, '账号已存在')

    // 3.创建用户
    const createdUser = await this.userRepository.create({
      account: input.account,
      password: await PasswordUtils.hash(input.password),
      nickname: IdUtils.shortId(),
      avatar: AvatarUtils.generate(input.account),
    })
    AssertUtils.notNull(createdUser, '注册失败')
    // 4.签发令牌
    return this.#issue(createdUser)
  }

  /**
   * 邮箱密码注册
   *
   * @param input 注册参数
   * @param req 请求对象，供登录日志记录来源
   * @returns 注册结果
   */
  async emailRegister(input: SysAuthEmailRegisterReq) {
    // 1.校验验证码
    const valid = await this.#verifyImageCaptcha(input.captchaId, input.captcha)
    AssertUtils.isTrue(valid, '验证码错误')

    // 2.校验邮箱是否已存在
    const user = await this.userRepository.findByEmail(input.email)
    AssertUtils.isNull(user, '账号已注册')

    // 3.创建用户
    const createdUser = await this.userRepository.create({
      email: input.email,
      account: input.email,
      password: await PasswordUtils.hash(input.password),
      nickname: IdUtils.shortId(),
      avatar: AvatarUtils.generate(input.email),
    })
    AssertUtils.notNull(createdUser, '注册失败')
    // 4.签发令牌
    return this.#issue(createdUser)
  }

  /**
   * 手机号密码注册
   *
   * @param input 注册参数
   * @returns 注册结果
   */
  async phoneRegister(input: SysAuthPhoneRegisterReq) {
    // 1.校验验证码
    const valid = await this.#verifyImageCaptcha(input.captchaId, input.captcha)
    AssertUtils.isTrue(valid, '验证码错误')

    // 2.校验手机号是否已存在
    const user = await this.userRepository.findByPhone(input.phone)
    AssertUtils.isNull(user, '账号已注册')

    // 3.创建用户
    const createdUser = await this.userRepository.create({
      phone: input.phone,
      account: input.phone,
      password: await PasswordUtils.hash(input.password),
      nickname: IdUtils.shortId(),
      avatar: AvatarUtils.generate(input.phone),
    })
    AssertUtils.notNull(createdUser, '注册失败')

    // 4.签发令牌
    return this.#issue(createdUser)
  }

  /**
   * 账号密码登录。
   *
   * @param input 登录参数
   */
  async login(input: SysAuthAccountLoginReq, req: Bun.BunRequest) {
    const payload: SysLoginLogEventPayload = {
      loginType: SYS_LOGIN_TYPE.Password,
      payload: { account: input.account },
      platform: input.platform as SysLoginPlatform,
      username: input.account,
      status: true,
    }
    // 1.校验验证码
    const valid = await this.#verifyImageCaptcha(input.captchaId, input.captcha)

    AssertUtils.isTrue(valid, () => {
      payload.failReason = '验证码错误'
      payload.status = false
      return '验证码错误'
    })

    // 2.检查账号密码输入是否正确
    const user = await this.authRepository.findUserByAccount(input.account)
    AssertUtils.notNull(user, () => {
      payload.failReason = '账号不存在'
      payload.status = false
      return '账号或密码输入错误'
    })

    const passwordValid = await PasswordUtils.verify(
      input.password,
      user.password
    )

    AssertUtils.isTrue(passwordValid, () => {
      payload.userId = user.id
      payload.failReason = '账号或密码输入错误'
      payload.status = false
      return '账号或密码输入错误'
    })

    // 3.异步写登录日志
    this.#withLoginLog(payload, req)

    // 4.签发令牌
    return this.#issue(user)
  }

  async devLogin(req: Bun.BunRequest) {
    const { captchaId } = await this.createImageCaptcha(req)
    const key = REDIS_KEY_PREFIX.ImageCaptcha(captchaId)
    const captcha = await this.redis.get(key)
    AssertUtils.notNull(captcha, '验证码不存在')
    return this.login(
      {
        account: 'admin',
        password: '123456',
        captchaId,
        captcha,
        platform: SYS_LOGIN_PLATFORM.Web,
      },
      req
    )
  }

  /**
   * 手机号登录；未注册的手机号自动创建账号。
   *
   * @param input 登录参数
   * @param req 请求对象，供登录日志记录来源
   */
  async phoneLogin(input: SysAuthPhoneLoginReq, req: Bun.BunRequest) {
    const payload: SysLoginLogEventPayload = {
      loginType: SYS_LOGIN_TYPE.Sms,
      platform: input.platform as SysLoginPlatform,
      status: true,
      username: input.phone,
      payload: { account: input.phone },
    }
    // 1.校验验证码
    const valid = await this.#verifySmsCaptcha(input.captchaId, input.captcha)
    AssertUtils.isTrue(valid, () => {
      payload.failReason = '验证码输入错误'
      payload.status = false
      return '验证码输入错误'
    })
    // 2.检查手机号是否存在
    const user = await this.authRepository.findUserByPhone(input.phone)
    AssertUtils.notNull(user, () => {
      payload.failReason = '账号不存在'
      payload.status = false
      return '账号不存在'
    })

    // 3.异步写登录日志
    this.#withLoginLog(payload, req)

    // 4.签发令牌
    return this.#issue(user)
  }

  /**
   * 扫码确认校验访问令牌与账号当前状态
   *
   * @param token 访问令牌
   * @returns 会话上下文
   */
  async verifyQrScanner(token: string) {
    const payload = await TokenUtils.verifyAccess(token)
    const user = await this.authRepository.findUserById(payload.sub)
    if (!user || !user.dataStatus || user.tenantId !== payload.tenantId) {
      throw new UnauthorizedError('账号不存在、已被禁用或租户已变更')
    }
    return {
      userId: user.id,
      account: user.account,
      tenantId: user.tenantId,
      roleId: user.roleId ?? undefined,
    } satisfies SessionContext
  }

  /**
   * 一次性扫码凭据确认后，复用正常登录的令牌签发与日志记录。
   */
  async qrLogin(_session: SessionContext) {}

  /**
   * 退出登录
   *
   * 令牌可能已经过期：用户把页面放着到过期再点登出，不该被 401 拒掉，所以
   * 只校验签名（`ignoreExpiry`）——签名仍然要过，日志里的主体才不会被伪造
   * 令牌污染。账号进载荷，用户 id 进列，令牌里的权限与有效期不进审计。
   *
   * @param req 请求对象
   */
  async logout(req: Bun.BunRequest) {
    const token = WebUtils.getToken(req)
    AssertUtils.notNull(token, '令牌不能为空')
    const claims = await TokenUtils.verifyAccess(token, { ignoreExpiry: true })
    console.log('claims:', claims)
    return Api.empty()
  }
}
