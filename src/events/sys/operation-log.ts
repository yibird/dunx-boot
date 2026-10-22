import { AppEvent, Logger, Module, OnEvent } from '@dunx/core'

export interface SysOperationLogEventPayload {}

export class SysOperationLogEvent extends AppEvent {
  constructor(
    readonly payload: SysOperationLogEventPayload,
    readonly req: Bun.BunRequest
  ) {
    super()
  }
}

export class SysOperationLogListener {
  constructor(private readonly logger: Logger) {}

  @OnEvent(SysOperationLogEvent)
  async writeLog(e: SysOperationLogEvent) {
    console.log(e)
  }
}

@Module({
  providers: [SysOperationLogListener],
  exports: [],
})
export class SysOperationLogEventModule {}
