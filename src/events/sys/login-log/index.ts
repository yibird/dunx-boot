import { Module } from '@dunx/core'
import { SysLoginLogEventHandler } from './handler'
import { SysLoginLogRepository } from '@/features/sys/login-log'

export { SysLoginLogEvent } from './event'
export type { SysLoginLogEventPayload } from './types'

@Module({
  providers: [SysLoginLogEventHandler, SysLoginLogRepository],
  exports: [],
})
export class SysLoginLogEventModule {}
