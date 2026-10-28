import { AppConfigService } from '@/infra/config'
import { PayloadTooLargeError } from '@/errors'
import type { Middleware, Next, RouteContext } from '@dunx/http'
import type { BunRequest } from 'bun'

/**
 * 请求体上限：按 `Content-Length` 在认证、压缩之前直接拒绝，避免把超大请求
 * 读进内存。没有 `Content-Length` 的 chunked 请求交给 Bun 自身的限制；
 * 文件上传走分片流式接口，不在这里拦。
 */
export class BodyLimitMiddleware implements Middleware {
  constructor(private readonly config: AppConfigService) {}

  handle(req: BunRequest, _ctx: RouteContext, next: Next): Promise<Response> {
    const limit = this.config.values.server.maxRequestBodyBytes
    if (limit > 0) {
      const { pathname } = new URL(req.url)
      const base = this.config.values.server.basePath.replace(/^\/+|\/+$/g, '')
      const filesPrefix = `/${base ? `${base}/` : ''}files`
      if (!pathname.startsWith(filesPrefix)) {
        const length = Number(req.headers.get('content-length') ?? 0)
        if (Number.isFinite(length) && length > limit) {
          throw new PayloadTooLargeError(
            `请求体超过上限（${length} > ${limit} 字节）`
          )
        }
      }
    }
    return next()
  }
}
