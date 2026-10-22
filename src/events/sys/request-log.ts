import { AppEvent, Logger, Module, OnEvent } from '@dunx/core'
import { SysRequestLogRepository } from '@/features/sys/request-log/repository'
import { getTenantId } from '@/infra/context'
import { getErrorMessage } from '@/errors'
import { AssertUtils, StringUtils } from '@/utils'
import type { SysRequestLogInsert } from '@/schemas'

/**
 * 请求日志事件载荷。
 *
 * 由请求日志中间件在请求结束时组装（见 `src/middleware/request-log.ts`）：
 * 中间件手里有完整的请求与响应，事件只负责把结果交给监听方落库。
 */
export interface SysRequestLogEventPayload {
  /**
   * 请求 id，每次请求唯一
   */
  requestId: string
  /**
   * 链路 id，来自 W3C Trace Context
   */
  traceId?: string | undefined
  /**
   * HTTP 方法
   */
  method: string
  /**
   * 完整请求 URL
   */
  url: string
  /**
   * 是否成功（HTTP 状态码小于 400）
   */
  success: boolean
  /**
   * HTTP 响应状态码
   */
  statusCode: number
  /**
   * 处理耗时（毫秒）
   */
  duration: number
  /**
   * 访问令牌
   */
  token?: string | undefined
  /**
   * 客户端 IP
   */
  ip?: string | undefined | null
  /**
   * User-Agent
   */
  userAgent?: string | undefined
  /**
   * 请求头快照（凭据类已剔除）
   */
  headers?: Record<string, string> | undefined
  /**
   * 请求参数：`{ query, body }`
   */
  params?: Record<string, unknown> | undefined
  /**
   * 响应体（JSON 且未超阈值时才有）
   */
  response?: unknown
  /**
   * 异常信息
   */
  errorMessage?: string | undefined
}

export class SysRequestLogEvent extends AppEvent {
  constructor(
    readonly payload: SysRequestLogEventPayload,
    readonly req: Bun.BunRequest
  ) {
    super()
  }
}

/**
 * 请求日志监听器：把事件落成 `sys_request_log` 一行。
 *
 * 写库失败只记日志、不抛错——请求日志不该影响已经返回给客户端的响应。
 */
export class SysRequestLogListener {
  constructor(
    private readonly logger: Logger,
    private readonly repository: SysRequestLogRepository
  ) {}

  @OnEvent(SysRequestLogEvent)
  async writeLog(e: SysRequestLogEvent) {
    const { payload } = e
    const row: SysRequestLogInsert = {
      requestId: StringUtils.truncate(payload.requestId, 128) ?? null,
      traceId: StringUtils.truncate(payload.traceId, 64) ?? null,
      method: payload.method,
      url: StringUtils.truncate(payload.url, 500) ?? '',
      success: payload.success,
      statusCode: payload.statusCode,
      duration: payload.duration,
      token: StringUtils.truncate(payload.token, 500) ?? null,
      ip: payload.ip ?? null,
      userAgent: StringUtils.truncate(payload.userAgent, 500) ?? null,
      headers: payload.headers ?? null,
      params: payload.params ?? null,
      response: payload.response ?? null,
      errorMessage: payload.errorMessage ?? null,
      tenantId: getTenantId(),
    }

    await AssertUtils.executeOnError(
      () => this.repository.create(row),
      (error) => {
        this.logger.error(`写入请求日志失败：${getErrorMessage(error)}`)
      }
    )
  }
}

@Module({
  providers: [SysRequestLogListener, SysRequestLogRepository],
  exports: [],
})
export class SysRequestLogEventModule {}
