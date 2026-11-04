import { Module } from '@dunx/core'
import { SysOperationLogEventHandler } from './handler'

export { SysOperationLogEvent } from './event'
export type { SysOperationLogEventPayload } from './types'

@Module({
  providers: [SysOperationLogEventHandler],
  exports: [],
})
export class SysOperationLogEventModule {}
