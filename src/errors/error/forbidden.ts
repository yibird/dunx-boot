import { ApiStatus, ApiStatusMessage } from '@/constants'
import { AppError } from './app'

/**
 * 权限不足错误。表示当前用户已经完成身份认证，但没有执行当前操作所需的权限。
 */
export class ForbiddenError extends AppError {
  /**
   * @param message 错误消息。
   */
  constructor(message: string = ApiStatusMessage[ApiStatus.FORBIDDEN]) {
    super({
      message,
      status: ApiStatus.FORBIDDEN,
    })
  }
}
