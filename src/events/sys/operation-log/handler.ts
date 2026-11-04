import { Logger, OnEvent } from '@dunx/core'
import { SysOperationLogEvent } from './event'

/**
 * 操作日志事件处理器
 */
export class SysOperationLogEventHandler {
  constructor(private readonly logger: Logger) {}

  @OnEvent(SysOperationLogEvent)
  async writeLog(e: SysOperationLogEvent) {
    console.log(e)
  }
}
