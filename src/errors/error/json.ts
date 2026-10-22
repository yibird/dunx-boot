import { ApiStatus } from '@/constants'
import { AppError } from './app'

/**
 * JSON 操作错误。用于表示 JSON 数据解析、序列化或反序列化过程中发生的错误。
 */
export class JsonError extends AppError {
  /**
   * @param message 错误消息。
   * @param cause 导致 JSON 操作失败的原始异常。
   */
  constructor(message: string = 'JSON 解析错误', cause?: unknown) {
    super({
      message,
      status: ApiStatus.BAD_REQUEST,
      cause,
    })
  }
}
