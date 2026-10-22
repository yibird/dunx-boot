import { ApiStatus, ApiStatusMessage } from '@/constants'
import { AppError } from './app'

/**
 * 服务端内部错误。用于表示服务器内部发生的未预期错误。
 */
export class ServerError extends AppError {
  /**
   * @param message 错误消息。
   * @param details 错误附加信息。
   * @param cause 导致当前错误的原始异常。
   */
  constructor(
    message: string = ApiStatusMessage[ApiStatus.INTERNAL_SERVER_ERROR],
    details?: unknown,
    cause?: unknown
  ) {
    super({
      message,
      status: ApiStatus.INTERNAL_SERVER_ERROR,
      details,
      expose: false,
      cause,
    })
  }
}
