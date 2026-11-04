import { Module } from '@dunx/core'
import { SysCaptchaLogEventHandler } from './handler'
import { SysCaptchaLogRepository } from '@/features/sys/captcha-log'

export { SysCaptchaLogEvent } from './event'
export type { SysCaptchaLogEventPayload } from './types'

@Module({
  providers: [SysCaptchaLogEventHandler, SysCaptchaLogRepository],
  exports: [],
})
export class SysCaptchaLogEventModule {}
