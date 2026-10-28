import { ApiStatus } from '@/constants'
import { AppError } from '@/errors'
import { SysRequestLogEvent } from '@/events'
import { IdUtils, WebUtils } from '@/utils'
import { AppConfigService } from '@/infra/config'
import { EventBus, Logger, RequestContext } from '@dunx/core'
import {
  ClientAddress,
  type Middleware,
  type Next,
  type RouteContext,
} from '@dunx/http'
import type { WebRequestSnapshot } from '@/utils'
import type { BunRequest } from 'bun'

/**
 * 这些前缀不打请求日志：健康探测、接口文档与运维面板会按秒级刷屏，
 * 把真正的业务请求淹掉。要改成全量记录，把这个数组清空即可。
 */
const SKIP_PREFIXES = [
  '/api/health',
  '/api/docs',
  '/api/openapi.json',
  '/api/metrics/openmetrics',
  '/_dunx',
] as const

/**
 * 一次请求的结果，交给 {@link RequestLogMiddleware} 组装事件。
 */
interface RequestOutcome {
  statusCode: number
  success: boolean
  response?: unknown
  errorMessage?: string
}

/**
 * 请求日志中间件：包住整条链，请求结束（正常返回或抛错）后发一个
 * {@link SysRequestLogEvent}，由监听器落库。
 *
 * 为什么是中间件而不是在各处埋点：只有中间件同时拿得到「请求开始的时刻」
 * 和「最终响应/异常」，耗时才测得准；而日志写入走事件总线，中间件本身
 * 不认识日志表。
 *
 * 挂载位置在 `globalMiddleware` 的会话守卫之后、限流之前：
 * - 守卫之后：`sessionContext` 已经写好，日志里的 `tenantId` 才是对的；
 * - 限流之前：被限流拒绝（429）的请求同样留下记录，而它正是要审计的。
 *
 * 代价是被会话守卫拒绝（401）的请求不会走到这里——那些请求没有会话，
 * 也没有租户，属于框架自身结构化日志的范畴。
 */
export class RequestLogMiddleware implements Middleware {
  constructor(
    private readonly bus: EventBus,
    private readonly context: RequestContext,
    private readonly address: ClientAddress,
    private readonly config: AppConfigService,
    private readonly logger: Logger
  ) {}

  async handle(
    req: BunRequest,
    ctx: RouteContext,
    next: Next
  ): Promise<Response> {
    const { pathname } = new URL(req.url)
    // 兼容任意全局前缀；对话和私有指令仅保存在受用户隔离的业务表。
    if (/\/ai\/(?:chat|agent|skill)(?:\/|$)/.test(ctx.path)) return next()
    if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return next()
    }

    // 采样只影响审计日志，不影响框架的请求指标。
    const { sampleRate, slowMs } = this.config.values.requestLog
    const sampled =
      sampleRate >= 1 || (sampleRate > 0 && Math.random() < sampleRate)

    const startedAt = performance.now()
    const request = WebUtils.getRequest(req)
    const ip = WebUtils.getIp(req)
    const params = sampled
      ? {
          query: request.query,
          body: ctx.parsesBody ? await WebUtils.getBody(req) : undefined,
        }
      : {}

    try {
      const response = await next()
      const snapshot = await WebUtils.getResponse(response)
      const durationMs = Math.round(performance.now() - startedAt)
      if (sampled) {
        this.#record(req, request, ip, params, durationMs, {
          statusCode: snapshot.status,
          success: snapshot.status < ApiStatus.BAD_REQUEST,
          response: snapshot.body,
        })
      }
      if (durationMs >= slowMs) {
        this.logger.warn('慢请求', {
          route: ctx.path,
          method: request.method,
          status: snapshot.status,
          durationMs,
        })
      }
      return response
    } catch (error) {
      const durationMs = Math.round(performance.now() - startedAt)
      const statusCode =
        error instanceof AppError
          ? error.status
          : ApiStatus.INTERNAL_SERVER_ERROR
      if (sampled) {
        this.#record(req, request, ip, params, durationMs, {
          statusCode,
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
        })
      }
      if (durationMs >= slowMs) {
        this.logger.warn('慢请求（失败）', {
          route: ctx.path,
          method: request.method,
          status: statusCode,
          durationMs,
        })
      }
      throw error
    }
  }

  #record(
    req: BunRequest,
    request: WebRequestSnapshot,
    ip: string | undefined | null,
    params: Record<string, unknown>,
    durationMs: number,
    outcome: RequestOutcome
  ) {
    this.bus.emit(
      new SysRequestLogEvent(
        {
          requestId: IdUtils.shortId(),
          traceId: this.context.getContext().traceId,
          method: request.method,
          url: request.url,
          success: outcome.success,
          statusCode: outcome.statusCode,
          duration: durationMs,
          token: request.token ?? undefined,
          ip,
          userAgent: request.userAgent ?? undefined,
          headers: request.headers,
          params,
          response: outcome.response,
          errorMessage: outcome.errorMessage,
        },
        req
      )
    )
  }
}
