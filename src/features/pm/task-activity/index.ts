import { Module } from '@dunx/core'
import { PmTaskActivityController } from './controller'
import { PmTaskActivityRepository } from './repository'
import { PmTaskActivityService } from './service'

/**
 * 任务动态模块
 */
@Module({
  imports: [],
  controllers: [PmTaskActivityController],
  providers: [PmTaskActivityRepository, PmTaskActivityService],
})
export class PmTaskActivityModule {}
