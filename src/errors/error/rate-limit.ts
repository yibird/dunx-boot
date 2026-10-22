import { ApiStatus, ApiStatusMessage } from '@/constants'
import { AppError } from './app'

/**
 * 请求频率超限错误。用于表示当前客户端在指定时间窗口内的请求次数超过系统限制。
 */
export class RateLimitError extends AppError {
  constructor(message: string = ApiStatusMessage[ApiStatus.TOO_MANY_REQUESTS]) {
    super({
      message,
      status: ApiStatus.TOO_MANY_REQUESTS,
    })
  }
}
