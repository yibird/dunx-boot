import {
  HTTP_AUTH_SCHEME,
  HTTP_BODY_LIMIT,
  HTTP_HEADER,
  HTTP_SENSITIVE_HEADERS,
  HTTP_VALUE_LIMIT,
} from '@/constants'
import { IpUtils } from './ip'
import { StringUtils } from './string'

/**
 * `Authorization: Bearer <token>` 的方案前缀，大小写不敏感。
 */
const BEARER_PREFIX = new RegExp(`^${HTTP_AUTH_SCHEME}\\s+`, 'i')

/**
 * `Request` / `Response` 的读取与截断。
 *
 * 放在 `utils` 而不是某一个业务模块里，是因为请求日志（中间件发事件）、
 * 登录日志与验证码日志（业务服务发事件）都要从请求上读同样的东西。
 *
 * 固定字符串（请求头名字、脱敏清单、阈值）都在 `@/constants/web`，这里不写魔法字符串。
 */

/**
 * 请求侧信息的一次性快照（同步取，不含请求体）。
 */
export interface WebRequestSnapshot {
  /**
   * HTTP 方法
   */
  method: string
  /**
   * 完整请求 URL
   */
  url: string
  /**
   * 查询参数
   */
  query: Record<string, string>
  /**
   * 请求头（凭据类已剔除）
   */
  headers: Record<string, string>
  /**
   * Bearer 访问令牌
   */
  token: string | null | undefined
  /**
   * 客户端 IP（代理头优先）
   */
  ip: string | null
  /**
   * User-Agent 原文
   */
  userAgent: string | null
}

/**
 * 响应侧信息的一次性快照。
 */
export interface WebResponseSnapshot {
  /**
   * HTTP 状态码
   */
  status: number
  /**
   * 响应体（JSON 且未超阈值时才有）
   */
  body: unknown
}

/**
 * 不落库的请求头集合。
 */
const SENSITIVE_HEADERS = new Set(HTTP_SENSITIVE_HEADERS)

/**
 * Web 工具类：请求与响应的静态方法。
 */
export class WebUtils {
  private constructor() {}

  /**
   * 把请求侧信息一次取齐（方法、URL、查询参数、请求头、令牌、IP、UA）。
   *
   * 请求体是异步的，单独用 {@link WebUtils.getBody} 取。
   *
   * @param req 请求对象
   * @return 请求快照
   */
  static getRequest(req: Request): WebRequestSnapshot {
    return {
      method: req.method,
      url: req.url,
      query: WebUtils.getQuery(req),
      headers: WebUtils.getHeaders(req),
      token: WebUtils.getToken(req),
      ip: WebUtils.getIp(req),
      userAgent: WebUtils.getUserAgent(req),
    }
  }

  /**
   * 请求头快照，跳过凭据类请求头。
   *
   * @param req 请求对象
   * @return 请求头键值对
   */
  static getHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {}
    for (const [name, value] of req.headers) {
      if (SENSITIVE_HEADERS.has(name.toLowerCase())) continue
      headers[name] = StringUtils.truncate(value, HTTP_VALUE_LIMIT) ?? ''
    }
    return headers
  }

  /**
   * 查询参数快照。
   *
   * @param req 请求对象
   * @return 查询参数键值对
   */
  static getQuery(req: Request): Record<string, string> {
    return Object.fromEntries(new URL(req.url).searchParams.entries())
  }

  /**
   * 客户端 IP：优先读代理头（`x-forwarded-for` / `x-real-ip`）。
   *
   * 没有代理头时返回 undefined——真实套接字地址只有框架绑定的
   * `ClientAddress` 拿得到，中间件那边会优先用它。
   *
   * @param req 请求对象
   * @return 客户端 IP 或 undefined
   */
  static getIp(req: Request): string | null {
    return IpUtils.fromHeaders(req.headers)
  }

  /**
   * 获取token
   *
   * 标准客户端按 `Authorization: Bearer <token>` 发送，令牌本身是裸 JWT，
   * 这里统一剥掉方案前缀：带前缀和不带前缀两种写法都能通过校验。
   *
   * @param req 请求对象
   * @return 令牌或null
   */
  static getToken(req: Request): string | null {
    const authorization = req.headers.get(HTTP_HEADER.AUTHORIZATION)
    if (!authorization) return null
    return authorization.replace(BEARER_PREFIX, '').trim() || null
  }

  /**
   * User-Agent 原文（按列宽截断）。
   *
   * @param req 请求对象
   * @return UA 字符串或 null
   */
  static getUserAgent(req: Request): string | null {
    return req.headers.get(HTTP_HEADER.USER_AGENT)
  }

  /**
   * 获取 OS
   *
   * @param ua userAgent
   * @returns OS | null
   */
  static getOS(ua?: string | null): string | null {
    if (!ua) return null
    if (/windows nt 10/i.test(ua)) return 'Windows 10/11'
    if (/windows nt/i.test(ua)) return 'Windows'
    if (/android/i.test(ua)) return 'Android'
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
    if (/mac os x/i.test(ua)) return 'macOS'
    if (/linux/i.test(ua)) return 'Linux'
    return 'Unknown'
  }

  /**
   * 获取 浏览器信息
   *
   * @param ua userAgent
   * @returns 浏览器信息或null
   */
  static getBrowser(ua?: string | null): string | null {
    if (!ua) return null
    if (/edg\//i.test(ua)) return 'Edge'
    if (/opr\/|opera/i.test(ua)) return 'Opera'
    if (/chrome\//i.test(ua) && !/edg|opr/i.test(ua)) return 'Chrome'
    if (/firefox\//i.test(ua)) return 'Firefox'
    if (/safari\//i.test(ua) && !/chrome|chromium/i.test(ua)) return 'Safari'
    if (/msie|trident/i.test(ua)) return 'IE'
    return 'Unknown'
  }

  /**
   * 获取 Device信息
   *
   * @param ua userAgent
   * @return Device信息或null
   */
  static getDevice(ua?: string | null): string | null {
    if (!ua) return null
    if (/iphone/i.test(ua)) return 'iPhone'
    if (/ipad/i.test(ua)) return 'iPad'
    if (/ipod/i.test(ua)) return 'iPod'
    if (/android/i.test(ua)) {
      const m = ua.match(/android[^;]*;\s*([^;)]+?)(?:\s+build\/|\))/i)
      return m ? (m[1] ?? '').trim() : 'Android'
    }
    if (/windows phone/i.test(ua)) return 'Windows Phone'
    return 'desktop'
  }

  /**
   * IP 归属地描述；私有地址与查不到的地址返回 undefined。
   *
   * ip2region 的库是惰性加载的，只建议在低频事件（登录、验证码）里调用。
   *
   * @param ip 客户端 IP
   * @return 形如 `中国 江苏省 南京市` 的描述或 undefined
   */
  static getIpLocation(ip: string | null): string | null {
    if (!ip) return null
    try {
      return IpUtils.describe(ip)
    } catch {
      return null
    }
  }

  /**
   * 请求体快照：只读 JSON，超过阈值或解析失败都返回 undefined。
   *
   * 读的是 `req.clone()`，业务侧读到的仍是原始请求体。
   *
   * @param req 请求对象
   * @return 脱敏后的请求体或 undefined
   */
  static async getBody(req: Request): Promise<unknown> {
    const contentType = req.headers.get(HTTP_HEADER.CONTENT_TYPE) ?? ''
    if (!contentType.includes('json')) return undefined
    try {
      const text = await req.clone().text()
      if (!text || text.length > HTTP_BODY_LIMIT) return undefined
      return JSON.parse(text) as unknown
    } catch {
      return undefined
    }
  }

  /**
   * 获取客户端信息
   *
   * @param req 请求对象
   * @returns 客户端信息
   */
  static getClientInfo(req: Request) {
    const ip = WebUtils.getIp(req)
    const userAgent = WebUtils.getUserAgent(req)
    const ipLocation = WebUtils.getIpLocation(ip)
    const browser = WebUtils.getBrowser(userAgent)
    const os = WebUtils.getOS(userAgent)
    const device = WebUtils.getDevice(userAgent)

    return { ip, ipLocation, userAgent, browser, os, device }
  }

  /**
   * 响应快照：状态码 + 脱敏后的 JSON 响应体。
   *
   * 响应体超过阈值、不是 JSON 或读失败都只记状态码。
   *
   * @param response 响应对象
   * @return 响应快照
   */
  static async getResponse(response: Response): Promise<WebResponseSnapshot> {
    return {
      status: response.status,
      body: await WebUtils.#responseBody(response),
    }
  }

  static async #responseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get(HTTP_HEADER.CONTENT_TYPE) ?? ''
    if (!contentType.includes('json')) return undefined
    const declared = Number(
      response.headers.get(HTTP_HEADER.CONTENT_LENGTH) ?? '0'
    )
    if (Number.isFinite(declared) && declared > HTTP_BODY_LIMIT)
      return undefined
    try {
      const text = await response.clone().text()
      if (text.length > HTTP_BODY_LIMIT) return undefined
      return JSON.parse(text) as unknown
    } catch {
      return undefined
    }
  }
}
