import { Module } from '@dunx/core'
import { SysLoginLogRepository } from './repository'
import { SysLoginLogService } from './service'
import { SysLoginLogController } from './controller'

@Module({
  imports: [],
  controllers: [SysLoginLogController],
  providers: [SysLoginLogRepository, SysLoginLogService],
})
export class SysLoginLogModule {}

export { SysLoginLogRepository, SysLoginLogService }
