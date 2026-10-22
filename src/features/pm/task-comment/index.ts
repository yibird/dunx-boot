import { Module } from '@dunx/core'
import { PmTaskCommentController } from './controller'
import { PmTaskCommentRepository } from './repository'
import { PmTaskCommentService } from './service'

/**
 * 任务评论模块
 */
@Module({
  imports: [],
  controllers: [PmTaskCommentController],
  providers: [PmTaskCommentRepository, PmTaskCommentService],
})
export class PmTaskCommentModule {}
