import { Module } from '@dunx/core'
import { PmProjectController } from './controller'
import { PmProjectRepository } from './repository'
import { PmProjectService } from './service'

/**
 * 项目模块
 */
@Module({
  imports: [],
  controllers: [PmProjectController],
  providers: [PmProjectRepository, PmProjectService],
})
export class PmProjectModule {}
