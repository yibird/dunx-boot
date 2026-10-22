import { AppError as FrameworkAppError, Logger } from '@dunx/core'
import { ErrorFilter, HttpError, ValidationError } from '@dunx/http'
import { AppError } from '@/errors'
import { Api } from '@/infra/model'
import { ApiStatus } from '@/constants'

/**
 * 全局异常处理：统一响应外壳，内部异常只记录到服务端日志。
 */
export class AppErrorFilter extends ErrorFilter {
  constructor(private readonly logger: Logger) {
    super()
  }

  override catch(error: unknown, req: Request): Response {
    if (error instanceof ValidationError) {
      const message = error.issues
        .map(
          (issue) => `${issue.path ? `${issue.path}: ` : ''}${issue.message}`
        )
        .join('; ')
      return Response.json(Api.error(error.status, message || error.message), {
        status: error.status,
        ...(error.headers && { headers: error.headers }),
      })
    }

    if (error instanceof AppError) {
      if (error.status >= ApiStatus.INTERNAL_SERVER_ERROR) {
        this.log(error, req)
      }
      return Response.json(
        Api.error(
          error.status,
          error.expose ? error.message : undefined,
          error.expose ? error.details : undefined
        ),
        { status: error.status }
      )
    }

    if (error instanceof HttpError) {
      return Response.json(Api.error(error.status, error.message), {
        status: error.status,
        ...(error.headers && { headers: error.headers }),
      })
    }

    if (error instanceof FrameworkAppError && isErrorStatus(error.status)) {
      if (error.status >= ApiStatus.INTERNAL_SERVER_ERROR) {
        this.log(error, req)
        return Response.json(Api.error(error.status), { status: error.status })
      }
      return Response.json(Api.error(error.status, error.message), {
        status: error.status,
      })
    }

    this.log(error, req)
    return Response.json(Api.error(ApiStatus.INTERNAL_SERVER_ERROR), {
      status: ApiStatus.INTERNAL_SERVER_ERROR,
    })
  }

  /**
   * Error 单独传入 Logger，保留堆栈与 cause，避免 JSON 序列化丢失异常。
   */
  private log(error: unknown, req: Request) {
    this.logger.error('请求处理失败', error, {
      method: req.method,
      path: new URL(req.url).pathname,
    })
  }
}

/**
 * 仅将合法的 HTTP 错误状态用于 Response。
 */
function isErrorStatus(status: number | undefined): status is number {
  return (
    status !== undefined &&
    Number.isInteger(status) &&
    status >= 400 &&
    status <= 599
  )
}
