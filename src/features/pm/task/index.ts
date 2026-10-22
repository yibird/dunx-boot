import { Module } from '@dunx/core'
import { PmTaskController } from './controller'
import { PmTaskRepository } from './repository'
import { PmTaskService } from './service'

/**
 * 任务模块
 */
@Module({
  imports: [],
  controllers: [PmTaskController],
  providers: [PmTaskRepository, PmTaskService],
})
export class PmTaskModule {}
