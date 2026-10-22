import { ApiStatus, ApiStatusMessage } from '@/constants'
import { AppError } from './app'

/**
 * 请求数据校验失败错误。
 *
 * 用于表示请求结构或字段值未通过业务或数据校验。
 *
 * 与 {@link BadRequestError} 相比，更适合用于明确的字段级校验失败。
 */
export class ValidationError extends AppError {
  /**
   * @param details 校验错误详情。
   * @param message 错误消息。
   */
  constructor(
    details: unknown,
    message: string = ApiStatusMessage[ApiStatus.UNPROCESSABLE_ENTITY]
  ) {
    super({
      message,
      status: ApiStatus.UNPROCESSABLE_ENTITY,
      details,
    })
  }
}
