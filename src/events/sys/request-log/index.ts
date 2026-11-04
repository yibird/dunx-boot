export { SysRequestLogEvent } from './event'
export type { SysRequestLogEventPayload } from './types'

import { Module } from '@dunx/core'
import { SysRequestLogRepository } from '@/features/sys/request-log/repository'
import { SysRequestLogEventHandler } from './handler'

@Module({
  providers: [SysRequestLogEventHandler, SysRequestLogRepository],
  exports: [],
})
export class SysRequestLogEventModule {}
