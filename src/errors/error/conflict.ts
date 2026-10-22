import { ApiStatus, ApiStatusMessage } from '@/constants'
import { AppError } from './app'

/**
 * 资源状态冲突错误。
 *
 * 用于表示当前请求与资源现有状态发生冲突，
 * 例如资源存在关联数据、重复创建或当前状态不允许执行指定操作。
 */
export class ConflictError extends AppError {
  /**
   * @param message 错误消息。
   * @param details 错误附加信息。
   */
  constructor(
    message: string = ApiStatusMessage[ApiStatus.CONFLICT],
    details?: unknown
  ) {
    super({
      message,
      status: ApiStatus.CONFLICT,
      details,
    })
  }
}
