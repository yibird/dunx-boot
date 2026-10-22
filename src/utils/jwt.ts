import type { AppConfigService, SecurityConfig } from '@/infra/config'
import { compactVerify, jwtVerify, SignJWT, type JWTPayload } from 'jose'
import { AssertUtils } from './assert'

/**
 * JWT 签发参数。
 */
export interface JwtSignOptions {
  /**
   * 有效期（秒）
   */
  expiresIn: number
  /**
   * 签发者（iss）
   */
  issuer?: string
  /**
   * 令牌唯一标识（jti）；缺省时自动生成
   */
  jti?: string
}

const encoder = new TextEncoder()

/**
 * JWT 工具类（HS256）。
 *
 * 只负责签名与校验，密钥由调用方显式传入，便于测试与多密钥场景；
 * 配置读取、访问/刷新令牌对编排见 `TokenUtils`。
 */
export class JwtUtils {
  /**
   * 应用配置
   */
  static #jwtConfig: SecurityConfig['auth'] | undefined

  private constructor() {}

  /**
   * 设置应用配置
   *
   * @param config 应用配置
   */
  static setConfig(config: AppConfigService) {
    JwtUtils.#jwtConfig = config.values.security.auth
  }

  static getConfig() {
    const config = JwtUtils.#jwtConfig
    AssertUtils.notNull(config, 'JwtUtils 尚未初始化，请先调用 setConfig()')
    AssertUtils.notNull(config.secret, 'security.auth.secret 不能为空')
    return {
      alg: config.alg ?? 'HS256',
      typ: config.typ ?? 'JWT',
      issuer: config.issuer,
      secret: config.secret,
      accessTtl: config.accessTtl,
      refreshTtl: config.refreshTtl,
    }
  }

  /**
   * 签发 JWT。
   *
   * @param payload 载荷
   * @param options 有效期、签发者与 jti
   * @return 签名后的 JWT
   */
  static async sign(
    payload: JWTPayload,
    options: JwtSignOptions
  ): Promise<string> {
    const { alg, typ, issuer, secret } = this.getConfig()
    AssertUtils.notNull(secret, 'security.auth.secret 不能为空')
    const builder = new SignJWT(payload)
      .setProtectedHeader({ alg, typ })
      .setIssuedAt()
      .setExpirationTime(`${options.expiresIn}s`)
      .setJti(options.jti ?? crypto.randomUUID())
      .setIssuer(options.issuer ?? issuer)
    return builder.sign(encoder.encode(secret))
  }

  /**
   * 校验 JWT 并返回载荷；签名、过期或签发者不符时抛错。
   *
   * @param token 待校验的 JWT
   * @return 校验通过的载荷
   */
  static async verify<T extends JWTPayload = JWTPayload>(
    token: string
  ): Promise<T> {
    const { alg, issuer, secret } = this.getConfig()
    const { payload } = await jwtVerify(token, encoder.encode(secret), {
      algorithms: [alg],
      ...(issuer ? { issuer } : {}),
    })
    return payload as T
  }

  /**
   * 只校验签名与算法，不看过期、签发者等声明。
   *
   * 给「过期也要放行」的场景用：登出时令牌可能已经过期，用户不该被 401
   * 挡住；但签名还是要过，日志里的主体才不会被伪造令牌污染。
   *
   * @param token 待校验的 JWT
   * @return 载荷
   */
  static async verifySignature<T extends JWTPayload = JWTPayload>(
    token: string
  ): Promise<T> {
    const { alg, secret } = this.getConfig()
    const { payload } = await compactVerify(token, encoder.encode(secret), {
      algorithms: [alg],
    })
    return JSON.parse(new TextDecoder().decode(payload)) as T
  }
}
