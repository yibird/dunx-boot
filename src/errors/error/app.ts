import { ApiStatus, type ApiStatusValue } from '@/constants'
import { AppError as DunxAppError } from '@dunx/core'

/**
 * 应用错误基类。
 *
 * 所有可预期、可处理的业务错误都应继承此类。
 *
 * HTTP 状态用于传输与默认消息，同时也是响应体的 `code`（`ApiStatus` 值）。
 *
 * 未知的异常对象不属于应用错误，通常应由全局错误处理器统一视为
 * 服务端内部错误（500）。
 *
 * `AppErrorFilter` 统一生成响应体，并按 expose 控制消息与附加信息的暴露。
 */
export class AppError extends DunxAppError {
  /**
   * HTTP 响应状态码。
   */
  override readonly status: ApiStatusValue

  /**
   * 错误附加信息，可用于携带校验错误、业务上下文等数据。
   *
   * 只有 `expose` 为 true 时才会出现在响应里。
   */
  readonly details?: unknown

  /**
   * 是否允许将错误消息与附加信息返回给客户端。
   *
   * 设置为 false 时，错误处理器只回一个通用消息，不暴露 message 与 details。
   */
  readonly expose: boolean

  /**
   * 创建应用错误。
   *
   * @param params 错误参数。
   * @param params.message 错误消息。
   * @param params.status HTTP 响应状态码，默认为 500。
   * @param params.details 错误附加信息。
   * @param params.expose 是否允许向客户端暴露错误消息与附加信息，默认为 true。
   * @param params.cause 导致当前错误的原始异常。
   */
  constructor(params: {
    message: string
    status?: ApiStatusValue
    details?: unknown
    expose?: boolean
    cause?: unknown
  }) {
    super(params.message, {
      cause: params.cause,
    })

    this.name = new.target.name
    this.status = params.status ?? ApiStatus.INTERNAL_SERVER_ERROR
    this.details = params.details
    this.expose = params.expose ?? true

    Error.captureStackTrace?.(this, new.target)
  }
}
