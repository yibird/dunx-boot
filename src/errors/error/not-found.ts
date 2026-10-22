import { ApiStatus, ApiStatusMessage } from '@/constants'
import { AppError } from './app'

/**
 * 资源不存在错误。
 *
 * 用于表示请求的资源不存在，或当前上下文中无法找到该资源。
 */
export class NotFoundError extends AppError {
  /**
   * @param message 错误消息。
   */
  constructor(message: string = ApiStatusMessage[ApiStatus.NOT_FOUND]) {
    super({
      message,
      status: ApiStatus.NOT_FOUND,
    })
  }
}
