import { AppEvent, Logger, Module, OnEvent, RequestContext } from '@dunx/core'
import { SysLoginLogRepository } from '@/features/sys/login-log'
import type { SysLoginType, SysLoginPlatform } from '@/constants'
import { getTenantId } from '@/infra/context'
import { getErrorMessage } from '@/errors'
import { AssertUtils, WebUtils } from '@/utils'
import type { SysLoginLogInsert } from '@/schemas'

/**
 * 登录日志事件载荷
 */
export interface SysLoginLogEventPayload {
  /**
   * 登录事件类型，取值见 `SYS_LOGIN_TYPE`
   */
  loginType: SysLoginType
  /**
   * 是否成功
   */
  status: boolean
  /**
   * 相关用户 id；登录成功、账号存在这类「动作里才知道」的信息由调用方补上
   */
  userId?: string | undefined
  /**
   * 登录username
   */
  username: string
  /**
   * 登录平台
   */
  platform: SysLoginPlatform
  /**
   * 登录失败原因
   */
  failReason?: string | undefined
  /**
   * 载荷
   */
  payload?: Record<string, unknown> | undefined
}

export class SysLoginLogEvent extends AppEvent {
  constructor(
    readonly payload: SysLoginLogEventPayload,
    readonly req: Bun.BunRequest
  ) {
    super()
  }
}

/**
 * 登录日志监听器
 */
export class SysLoginLogListener {
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

@Module({
  providers: [SysLoginLogListener, SysLoginLogRepository],
  exports: [],
})
export class SysLoginLogEventModule {}
