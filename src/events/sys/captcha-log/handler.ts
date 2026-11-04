import { Logger, OnEvent } from '@dunx/core'
import { AssertUtils, DateUtils, StringUtils, WebUtils } from '@/utils'
import {
  HTTP_MASKED_VALUE,
  REDIS_KEY_TTL,
  SYS_CAPTCHA_STATUS,
} from '@/constants'
import { getTenantId } from '@/infra/context'
import { getErrorMessage } from '@/errors'
import { SysCaptchaLogEvent } from './event'
import { SysCaptchaLogRepository } from '@/features/sys/captcha-log'
import { AppConfigService } from '@/infra/config'
import type { SysCaptchaLogInsert } from '@/schemas'

/**
 * 验证码日志事件处理器
 */
export class SysCaptchaLogEventHandler {
  constructor(
    private readonly logger: Logger,
    private readonly repository: SysCaptchaLogRepository,
    private readonly config: AppConfigService
  ) {}

  @OnEvent(SysCaptchaLogEvent)
  async writeLog(e: SysCaptchaLogEvent) {
    const { payload, req } = e
    const expireAt = DateUtils.format(
      Date.now() + (payload.ttl ?? REDIS_KEY_TTL.ImageCaptcha)
    )
    const row: SysCaptchaLogInsert = {
      captchaId: StringUtils.truncate(payload.captchaId, 64) ?? '',
      captchaValue: HTTP_MASKED_VALUE,
      captchaType: payload.captchaType,
      target: StringUtils.truncate(payload.target, 128) ?? null,
      ip: WebUtils.getIp(req) ?? null,
      status: SYS_CAPTCHA_STATUS.Pending,
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
