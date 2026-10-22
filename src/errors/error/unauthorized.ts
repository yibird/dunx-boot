import { ApiStatus, ApiStatusMessage } from '@/constants'
import { AppError } from './app'

/**
 * 未认证错误。
 *
 * 表示请求需要身份认证，但当前请求未提供有效的认证凭据。
 */
export class UnauthorizedError extends AppError {
  /**
   * @param message 错误消息。
   */
  constructor(message: string = ApiStatusMessage[ApiStatus.UNAUTHORIZED]) {
    super({
      message,
      status: ApiStatus.UNAUTHORIZED,
    })
  }
}
