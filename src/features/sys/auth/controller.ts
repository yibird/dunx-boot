import { Controller, Get, Post, type Input } from '@dunx/http'
import { ApiDoc } from '@dunx/openapi'
import { isProd } from '@/infra/config'
import { Api, apiRouteResponse } from '@/infra/model'
import { ApiStatus } from '@/constants'
import {
  sysAuthAccountLoginReqSchema,
  sysAuthAccountRegisterReqSchema,
  sysAuthEmailRegisterReqSchema,
  sysAuthImageCaptchaRespSchema,
  sysAuthPhoneLoginReqSchema,
  sysAuthPhoneRegisterReqSchema,
  sysAuthSessionSchema,
  sysAuthSmsCaptchaReqSchema,
  sysAuthSmsCaptchaRespSchema,
} from './schema'
import { SysAuthService } from './service'

export const routes = {
  imageCaptcha: {
    status: ApiStatus.OK,
    response: apiRouteResponse(sysAuthImageCaptchaRespSchema),
  },
  smsCaptcha: {
    status: ApiStatus.OK,
    body: sysAuthSmsCaptchaReqSchema,
    response: apiRouteResponse(sysAuthSmsCaptchaRespSchema),
  },
  accountRegister: {
    status: ApiStatus.OK,
    body: sysAuthAccountRegisterReqSchema,
    response: apiRouteResponse(sysAuthSessionSchema),
  },
  emailRegister: {
    status: ApiStatus.OK,
    body: sysAuthEmailRegisterReqSchema,
    response: apiRouteResponse(sysAuthSessionSchema),
  },
  phoneRegister: {
    status: ApiStatus.OK,
    body: sysAuthPhoneRegisterReqSchema,
    response: apiRouteResponse(sysAuthSessionSchema),
  },
  accountLogin: {
    status: ApiStatus.OK,
    body: sysAuthAccountLoginReqSchema,
    response: apiRouteResponse(sysAuthSessionSchema),
  },
  devLogin: {
    status: ApiStatus.OK,
    response: apiRouteResponse(sysAuthSessionSchema),
  },
  phoneLogin: {
    status: ApiStatus.OK,
    body: sysAuthPhoneLoginReqSchema,
    response: apiRouteResponse(sysAuthSessionSchema),
  },
  logout: {
    status: ApiStatus.OK,
    response: apiRouteResponse(),
  },
  qrLogin: { response: apiRouteResponse(sysAuthSessionSchema) },
} as const

/**
 * 认证控制器:验证码、注册、账号/手机号/扫码登录、刷新、退出与当前用户。
 */
@ApiDoc({ tags: ['认证'] })
@Controller('auth', { excludes: isProd() ? ['devLogin'] : [] })
export class SysAuthController {
  constructor(private readonly authService: SysAuthService) {}

  @ApiDoc({ summary: '获取图形验证码' })
  @Get('/captcha/image', routes.imageCaptcha)
  async getImageCaptcha({ req }: Input) {
    const res = await this.authService.createImageCaptcha(req)
    return Api.ok(res)
  }

  @ApiDoc({ summary: '获取短信验证码' })
  @Post('/captcha/sms', routes.smsCaptcha)
  async getSmsCaptcha({ body, req }: Input<typeof routes.smsCaptcha>) {
    const res = await this.authService.smsCaptcha(body.phone, req)
    return Api.ok(res)
  }

  @ApiDoc({ summary: '账号密码注册' })
  @Post('/register/account', routes.accountRegister)
  async accountRegister({ body }: Input<typeof routes.accountRegister>) {
    const res = await this.authService.accountRegister(body)
    return Api.ok(res)
  }

  @ApiDoc({ summary: '邮箱密码注册' })
  @Post('/register/email', routes.emailRegister)
  async emailRegister({ body }: Input<typeof routes.emailRegister>) {
    const res = await this.authService.emailRegister(body)
    return Api.ok(res)
  }

  @ApiDoc({ summary: '手机号密码注册' })
  @Post('/register/phone', routes.phoneRegister)
  async phoneRegister({ body }: Input<typeof routes.phoneRegister>) {
    const res = await this.authService.phoneRegister(body)
    return Api.ok(res)
  }

  @ApiDoc({ summary: '账号密码登录' })
  @Post('/login', routes.accountLogin)
  async accountLogin(input: Input<typeof routes.accountLogin>) {
    const res = await this.authService.login(input.body, input.req)
    return Api.ok(res)
  }

  @ApiDoc({ summary: '开发快速登录' })
  @Post('/devLogin', routes.devLogin)
  async devLogin({ req }: Input) {
    const res = await this.authService.devLogin(req)
    return Api.ok(res)
  }

  @ApiDoc({ summary: '手机号登录' })
  @Post('/login/phone', routes.phoneLogin)
  async phoneLogin(input: Input<typeof routes.phoneLogin>) {
    const res = await this.authService.phoneLogin(input.body, input.req)
    return Api.ok(res)
  }

  @ApiDoc({ summary: '退出登录' })
  @Post('/logout', routes.logout)
  async logout({ req }: Input<{}>) {
    return this.authService.logout(req)
  }

  @ApiDoc({ summary: '获取扫码登录二维码' })
  @Get('/qr', routes.qrLogin)
  async qrLogin({ req }: Input<{}>) {
    const res = await this.authService.devLogin(req)
    return Api.ok(res)
  }
}
