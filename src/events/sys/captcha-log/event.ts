import { AppEvent } from '@dunx/core'
import type { SysCaptchaLogEventPayload } from './types'

export class SysCaptchaLogEvent extends AppEvent {
  constructor(
    readonly payload: SysCaptchaLogEventPayload,
    readonly req: Bun.BunRequest
  ) {
    super()
  }
}
