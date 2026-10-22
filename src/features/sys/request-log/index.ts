import { Module } from '@dunx/core'
import { SysRequestLogRepository } from './repository'
import { SysRequestLogService } from './service'
import { SysRequestLogController } from './controller'

@Module({
  imports: [],
  controllers: [SysRequestLogController],
  providers: [SysRequestLogRepository, SysRequestLogService],
})
export class SysRequestLogModule {}
