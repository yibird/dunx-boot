import { AppEvent } from '@dunx/core'
import type { SysLoginLogEventPayload } from './types'

export class SysLoginLogEvent extends AppEvent {
  constructor(
    readonly payload: SysLoginLogEventPayload,
    readonly req: Bun.BunRequest
  ) {
    super()
  }
}
