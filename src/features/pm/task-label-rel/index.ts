import { Module } from '@dunx/core'
import { PmTaskLabelRelController } from './controller'
import { PmTaskLabelRelRepository } from './repository'
import { PmTaskLabelRelService } from './service'

/**
 * 任务标签关联模块
 */
@Module({
  imports: [],
  controllers: [PmTaskLabelRelController],
  providers: [PmTaskLabelRelRepository, PmTaskLabelRelService],
})
export class PmTaskLabelRelModule {}
