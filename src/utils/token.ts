import { HTTP_AUTH_SCHEME } from '@/constants'
import { UnauthorizedError } from '@/errors'
import { DateUtils } from './date'
import { JwtUtils } from './jwt'
import { IdUtils } from './id'
import type { JWTPayload } from 'jose'
import type { AppConfigService } from '@/infra/config'

const TOKEN_SCHEMA = {
  BEARER: HTTP_AUTH_SCHEME,
  BASIC: 'Basic',
}
const TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const

export type TokenType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE]
export type TokenSchema = (typeof TOKEN_SCHEMA)[keyof typeof TOKEN_SCHEMA]

/**
 * 令牌校验选项。
 */
export interface TokenVerifyOptions {
  /**
   * 只校验签名，忽略过期等声明；给「过期也要放行」的场景用
   */
  ignoreExpiry?: boolean
}

/**
 * 认证令牌载荷
 */
export interface AuthTokenPayload extends JWTPayload {
  /**
   * 用户ID
   */
  sub: string
  /**
   * 令牌类型
   */
  type: TokenType
  /**
   * 账号
   */
  account?: string
  /**
   * 租户ID；平台级账号可以为空
   */
  tenantId?: string | undefined
  /**
   * 角色id
   */
  roleId?: string | null | undefined
}

/**
 * 令牌对及刷新令牌的落库信息。
 */
export interface TokenPair {
  /**
   * 访问令牌
   */
  accessToken: string
  /**
   * 刷新令牌
   */
  refreshToken: string
  /**
   * 令牌模式
   * @default 'Bearer'
   */
  tokenType: TokenSchema
  /**
   * 访问令牌有效期（秒）
   */
  expiresIn: number
  /**
   * 刷新令牌 jti（用于落库与吊销）
   */
  refreshJti: string
  /**
   * 刷新令牌过期时间（格式化字符串）
   */
  refreshExpiresAt: string
}

/**
 * 签发令牌所需的用户信息。
 */
export interface UserClaims {
  readonly id: string
  readonly account: string
  /**
   * 租户ID；平台级账号可以为空
   */
  readonly tenantId?: string | undefined
  readonly roleId?: string | null | undefined
  readonly permissions: string[]
}

/**
 * 令牌工具：编排访问令牌与刷新令牌的签发、校验
 */
export class TokenUtils {
  /**
   * 设置 JWT 配置
   * @param config 应用配置
   */
  static setConfig(config: AppConfigService) {
    JwtUtils.setConfig(config)
  }

  /**
   * 获取 JWT 配置
   * @returns 应用配置
   */
  static getConfig() {
    return JwtUtils.getConfig()
  }

  /**
   * 签发访问令牌 + 刷新令牌
   *
   * @param config 应用配置（读 `security.auth`）
   * @param user 用户声明
   * @returns 令牌对
   */
  static async issue(user: UserClaims): Promise<TokenPair> {
    const { accessTtl, refreshTtl, issuer } = JwtUtils.getConfig()
    const jti = IdUtils.uuid()
    const [accessToken, refreshToken] = await Promise.all([
      JwtUtils.sign(
        {
          sub: user.id,
          type: TOKEN_TYPE.ACCESS,
          account: user.account,
          tenantId: user.tenantId,
          roleId: user.roleId,
        } satisfies AuthTokenPayload,
        { expiresIn: accessTtl }
      ),
      JwtUtils.sign(
        { sub: user.id, type: TOKEN_TYPE.REFRESH },
        {
          expiresIn: refreshTtl,
          issuer,
          jti,
        }
      ),
    ])

    return {
      accessToken,
      refreshToken,
      tokenType: TOKEN_SCHEMA.BEARER,
      expiresIn: accessTtl,
      refreshJti: jti,
      refreshExpiresAt: DateUtils.format(Date.now() + refreshTtl * 1000),
    }
  }

  /**
   * 校验访问令牌。
   *
   * @param token 访问令牌
   * @param options `ignoreExpiry` 时只验签名，过期令牌也算通过
   * @returns 令牌载荷
   */
  static async verifyAccess(token: string, options?: TokenVerifyOptions) {
    return TokenUtils.#verify(token, TOKEN_TYPE.ACCESS, options)
  }

  /**
   * 校验刷新令牌。
   *
   * @param token 刷新令牌
   * @param options `ignoreExpiry` 时只验签名，过期令牌也算通过
   * @returns 令牌载荷
   */
  static async verifyRefresh(token: string, options?: TokenVerifyOptions) {
    return TokenUtils.#verify(token, TOKEN_TYPE.REFRESH, options)
  }

  /**
   * 校验令牌。
   *
   * @param token 令牌
   * @param type 令牌类型
   * @param options 校验选项
   * @returns 令牌载荷
   */
  static async #verify(
    token: string,
    type: TokenType,
    options?: TokenVerifyOptions
  ): Promise<AuthTokenPayload> {
    try {
      const payload = options?.ignoreExpiry
        ? await JwtUtils.verifySignature<AuthTokenPayload>(token)
        : await JwtUtils.verify<AuthTokenPayload>(token)
      if (payload.type !== type || typeof payload.sub !== 'string') {
        throw new UnauthorizedError('无效令牌')
      }
      return payload
    } catch {
      throw new UnauthorizedError('无效令牌')
    }
  }
}
