import { ApiStatus, ApiStatusMessage } from '@/constants'
import { AppError } from './app'

/**
 * 请求参数错误。
 *
 * 用于表示请求本身不符合接口要求，例如参数格式错误、
 * 参数缺失或参数值不符合基本要求。
 */
export class BadRequestError extends AppError {
  /**
   * @param message 错误消息。
   * @param details 错误附加信息。
   */
  constructor(
    message: string = ApiStatusMessage[ApiStatus.BAD_REQUEST],
    details?: unknown
  ) {
    super({
      message,
      status: ApiStatus.BAD_REQUEST,
      details,
    })
  }
}
