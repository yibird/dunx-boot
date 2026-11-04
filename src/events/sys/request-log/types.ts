/**
 * 请求日志事件载荷。
 *
 * 由请求日志中间件在请求结束时组装（见 `src/middleware/request-log.ts`）：
 * 中间件手里有完整的请求与响应，事件只负责把结果交给监听方落库。
 */
export interface SysRequestLogEventPayload {
  /**
   * 请求 id，每次请求唯一
   */
  requestId: string
  /**
   * 链路 id，来自 W3C Trace Context
   */
  traceId?: string | undefined
  /**
   * HTTP 方法
   */
  method: string
  /**
   * 完整请求 URL
   */
  url: string
  /**
   * 是否成功（HTTP 状态码小于 400）
   */
  success: boolean
  /**
   * HTTP 响应状态码
   */
  statusCode: number
  /**
   * 处理耗时（毫秒）
   */
  duration: number
  /**
   * 访问令牌
   */
  token?: string | undefined
  /**
   * 客户端 IP
   */
  ip?: string | undefined | null
  /**
   * User-Agent
   */
  userAgent?: string | undefined
  /**
   * 请求头快照（凭据类已剔除）
   */
  headers?: Record<string, string> | undefined
  /**
   * 请求参数：`{ query, body }`
   */
  params?: Record<string, unknown> | undefined
  /**
   * 响应体（JSON 且未超阈值时才有）
   */
  response?: unknown
  /**
   * 异常信息
   */
  errorMessage?: string | undefined
}
