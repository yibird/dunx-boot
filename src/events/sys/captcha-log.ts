import { SYS_CAPTCHA_STATUS } from '@/features/sys/auth/constant'
import { SysCaptchaLogRepository } from '@/features/sys/captcha-log/repository'
import { getTenantId } from '@/infra/context'
import { AppConfigService } from '@/infra/config'
import { REDIS_KEY_TTL, HTTP_MASKED_VALUE } from '@/constants'
import type { SysCaptchaLogInsert } from '@/schemas'
import { AssertUtils, DateUtils, StringUtils, WebUtils } from '@/utils'
import { AppEvent, Logger, Module, OnEvent } from '@dunx/core'
import { getErrorMessage } from '@/errors'

/**
 * 验证码日志事件载荷
 */
export interface SysCaptchaLogEventPayload {
  /**
   * 业务侧验证码唯一标识
   */
  captchaId: string
  /**
   * 验证码类型
   */
  captchaType: number
  /**
   * 脱敏后的接收目标（手机号、邮箱）
   */
  target?: string | undefined
  /**
   * 有效期（毫秒），缺省按图片验证码算
   */
  ttl?: number | undefined
  /**
   * 其余上下文，原样存入 `payload` 列
   */
  payload?: Record<string, unknown> | undefined
}

export class SysCaptchaLogEvent extends AppEvent {
  constructor(
    readonly payload: SysCaptchaLogEventPayload,
    readonly req: Bun.BunRequest
  ) {
    super()
  }
}

/**
 * 验证码日志监听器：把事件落成 `sys_captcha_log` 一行，状态为「待验证」。
 *
 * 写库失败只记日志、不抛错——验证码已经发给用户了，日志不该让它失败。
 */
export class SysCaptchaLogListener {
  constructor(
    private readonly logger: Logger,
    private readonly repository: SysCaptchaLogRepository,
    private readonly config: AppConfigService
  ) {}

  @OnEvent(SysCaptchaLogEvent)
  async writeLog(e: SysCaptchaLogEvent) {
    const { payload, req } = e
    const expireAt = DateUtils.format(
      Date.now() + (payload.ttl ?? REDIS_KEY_TTL.IMAGE_CAPTCHA)
    )
    const row: SysCaptchaLogInsert = {
      captchaId: StringUtils.truncate(payload.captchaId, 64) ?? '',
      captchaValue: HTTP_MASKED_VALUE,
      captchaType: payload.captchaType,
      target: StringUtils.truncate(payload.target, 128) ?? null,
      ip: WebUtils.getIp(req) ?? null,
      status: SYS_CAPTCHA_STATUS.PENDING,
      used: false,
      attempts: 0,
      expireAt,
      payload: payload.payload ?? {},
      tenantId: getTenantId(),
    }

    await AssertUtils.executeOnError(
      () => this.repository.create(row),
      (error) => {
        this.logger.error(`写入验证码日志失败：${getErrorMessage(error)}`)
      }
    )
  }
}

@Module({
  providers: [SysCaptchaLogListener, SysCaptchaLogRepository],
  exports: [],
})
export class SysCaptchaLogEventModule {}
