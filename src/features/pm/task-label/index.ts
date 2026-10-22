import { Module } from '@dunx/core'
import { PmTaskLabelController } from './controller'
import { PmTaskLabelRepository } from './repository'
import { PmTaskLabelService } from './service'

/**
 * 任务标签模块
 */
@Module({
  imports: [],
  controllers: [PmTaskLabelController],
  providers: [PmTaskLabelRepository, PmTaskLabelService],
})
export class PmTaskLabelModule {}
