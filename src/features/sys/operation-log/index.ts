import { Module } from '@dunx/core'
import { SysOperationLogRepository } from './repository'
import { SysOperationLogService } from './service'
import { SysOperationLogController } from './controller'

/**
 * 操作日志模块
 */
@Module({
  imports: [],
  controllers: [SysOperationLogController],
  providers: [SysOperationLogRepository, SysOperationLogService],
})
export class SysOperationLogModule {}
