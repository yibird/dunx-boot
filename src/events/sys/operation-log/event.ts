import { AppEvent } from '@dunx/core'
import type { SysOperationLogEventPayload } from './types'

export class SysOperationLogEvent extends AppEvent {
  constructor(
    readonly payload: SysOperationLogEventPayload,
    readonly req: Bun.BunRequest
  ) {
    super()
  }
}
