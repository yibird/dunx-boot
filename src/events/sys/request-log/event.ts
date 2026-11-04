import { AppEvent } from '@dunx/core'
import type { SysRequestLogEventPayload } from './types'

export class SysRequestLogEvent extends AppEvent {
  constructor(
    readonly payload: SysRequestLogEventPayload,
    readonly req: Bun.BunRequest
  ) {
    super()
  }
}
