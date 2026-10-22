/**
 * 请求/响应相关的固定字符串与阈值。
 *
 * 这些值以前散落在工具类里当魔法字符串用，集中到这里之后请求头名字只有一份。
 */

/**
 * 会用到的请求头/响应头名字（小写，`Headers` 的键就是小写）。
 */
export const HTTP_HEADER = {
  AUTHORIZATION: 'authorization',
  COOKIE: 'cookie',
  SET_COOKIE: 'set-cookie',
  PROXY_AUTHORIZATION: 'proxy-authorization',
  CONTENT_TYPE: 'content-type',
  CONTENT_LENGTH: 'content-length',
  USER_AGENT: 'user-agent',
  FORWARDED_FOR: 'x-forwarded-for',
  REAL_IP: 'x-real-ip',
} as const

/**
 * 认证方案：`Authorization: Bearer <token>`。
 */
export const HTTP_AUTH_SCHEME = 'Bearer'

/**
 * 不落库的请求头：凭据与 Cookie 不该出现在日志里。
 */
export const HTTP_SENSITIVE_HEADERS: readonly string[] = [
  HTTP_HEADER.AUTHORIZATION,
  HTTP_HEADER.COOKIE,
  HTTP_HEADER.SET_COOKIE,
  HTTP_HEADER.PROXY_AUTHORIZATION,
]

/**
 * 敏感验证码等固定值的日志占位符。
 */
export const HTTP_MASKED_VALUE = '******'

/**
 * 识别不出浏览器/操作系统/客户端时的占位值。
 */
export const HTTP_UNKNOWN = 'unknown'

/**
 * 入库前记录请求体/响应体的最大字符数，超过就只记 `undefined`。
 * 列表接口动辄几百 KB，整份塞进 jsonb 既慢又没什么排查价值。
 */
export const HTTP_BODY_LIMIT = 8 * 1024

/**
 * 单值（请求头、UA）入库前截断的长度，对齐 varchar(500)。
 */
export const HTTP_VALUE_LIMIT = 500
