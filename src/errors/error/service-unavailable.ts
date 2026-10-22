import { ApiStatus, ApiStatusMessage } from '@/constants'
import { AppError } from './app'

/**
 * 服务暂不可用错误。用于表示服务当前暂时无法处理请求，例如依赖服务不可用、服务过载或正在进行临时维护。
 */
export class ServiceUnavailableError extends AppError {
  /**
   * @param message 错误消息。
   * @param details 错误附加信息。
   */
  constructor(
    message: string = ApiStatusMessage[ApiStatus.SERVICE_UNAVAILABLE],
    details?: unknown
  ) {
    super({
      message,
      status: ApiStatus.SERVICE_UNAVAILABLE,
      details,
    })
  }
}
