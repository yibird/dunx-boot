import { Logger, OnEvent, RequestContext } from '@dunx/core'
import { SysLoginLogEvent } from './event'
import { AssertUtils, WebUtils } from '@/utils'
import { getTenantId } from '@/infra/context'
import { getErrorMessage } from '@/errors'
import type { SysLoginLogInsert } from '@/schemas'
import { SysLoginLogRepository } from '@/features/sys/login-log'
/**
 * 登录日志事件处理器
 */
export class SysLoginLogEventHandler {
  constructor(
    private readonly logger: Logger,
    private readonly repository: SysLoginLogRepository,
    private readonly context: RequestContext
  ) {}

  @OnEvent(SysLoginLogEvent)
  async writeLog(e: SysLoginLogEvent) {
    const { payload, req } = e
    const sysLoginLog: SysLoginLogInsert = {
      ...payload,
      ...WebUtils.getClientInfo(req),
      traceId: this.context.getContext().traceId,
      payload: payload.payload,
      tenantId: getTenantId(),
    }

    await AssertUtils.executeOnError(
      () => this.repository.create(sysLoginLog),
      (error) =>
        this.logger.error(`写入登录日志失败：${getErrorMessage(error)}`)
    )
  }
}
