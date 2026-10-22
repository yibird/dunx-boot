import { ApiStatus, ApiStatusMessage } from '@/constants'

/**
 * 获取业务响应码对应的默认消息。
 *
 * @param code 业务响应码
 * @return 对应的客户端消息
 */
export function getRespMessage(code: number) {
  const messages: Readonly<Partial<Record<number, string>>> = ApiStatusMessage
  return messages[code] ?? '请求处理失败'
}

/**
 * 统一的 API 响应包装结构。
 *
 * 每个接口都返回该结构：`{ code, message, data }`。
 * - `code`    业务状态码（{@link ApiStatus}）
 * - `message` 可读的描述信息
 * - `data`    数据载荷（任意类型；无内容返回时为 `null`）
 */
export class Api<T = unknown> {
  code: number
  message: string
  data: T

  constructor(code: number, message: string, data: T) {
    this.code = code
    this.message = message
    this.data = data
  }

  /**
   * 成功响应包装。
   * @param data 返回给客户端的数据载荷
   * @param message 可选的自定义消息，缺省时使用成功默认消息
   * @return 包装后的成功响应实例
   */
  static ok<T>(data: T, message?: string) {
    return {
      code: ApiStatus.SUCCESS,
      message: message ?? getRespMessage(ApiStatus.SUCCESS),
      data,
    }
  }

  /**
   * 无数据载荷的成功响应包装（`data: null`）。
   *
   * @param message 可选的自定义消息，缺省时使用成功默认消息
   * @return `data` 为 null 的成功响应实例
   */
  static empty(message?: string) {
    return {
      code: ApiStatus.SUCCESS,
      message: message ?? getRespMessage(ApiStatus.SUCCESS),
      data: null,
    }
  }

  /**
   * 错误响应包装（数据载荷默认为 `null`）。
   *
   * `code` 就是状态码本身（`ApiStatus` 值）：成功固定为 0，失败是 400/401/403/404/500
   * 之一，客户端凭 `code` 即可区分错误类型；`message` 缺省时按状态码取默认消息。
   *
   * @param status 响应状态码，同时作为响应体 code
   * @param message 可选的自定义消息，缺省时按状态码取默认消息
   * @param data 可选的数据载荷，缺省时为 null
   * @return 包装后的错误响应实例
   */
  static error<T = null>(
    status: number = ApiStatus.ERR,
    message?: string | null,
    data?: T
  ) {
    return {
      code: status,
      message: message ?? getRespMessage(status),
      data: data ?? null,
    }
  }
}

export function getApiMessage(code: number) {
  return getRespMessage(code)
}
