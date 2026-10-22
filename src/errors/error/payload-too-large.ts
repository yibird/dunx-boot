import { ApiStatus, ApiStatusMessage } from '@/constants'
import { AppError } from './app'

/**
 * 请求负载过大错误。用于表示请求体、上传文件或其他请求负载超过系统允许的大小限制。
 */
export class PayloadTooLargeError extends AppError {
  constructor(message: string = ApiStatusMessage[ApiStatus.PAYLOAD_TOO_LARGE]) {
    super({
      message,
      status: ApiStatus.PAYLOAD_TOO_LARGE,
    })
  }
}
