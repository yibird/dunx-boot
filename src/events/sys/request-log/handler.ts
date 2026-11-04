import { Logger, OnEvent } from '@dunx/core'
import { SysRequestLogEvent } from './event'
import { AssertUtils, StringUtils } from '@/utils'
import { getTenantId } from '@/infra/context'
import { getErrorMessage } from '@/errors'
import { SysRequestLogRepository } from '@/features/sys/request-log/repository'
import type { SysRequestLogInsert } from '@/schemas'

/**
 * 请求日志事件处理器
 */
export class SysRequestLogEventHandler {
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
