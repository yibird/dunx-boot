import { Module } from '@dunx/core'
import { PmTaskAttachmentController } from './controller'
import { PmTaskAttachmentRepository } from './repository'
import { PmTaskAttachmentService } from './service'

/**
 * 任务附件模块
 */
@Module({
  imports: [],
  controllers: [PmTaskAttachmentController],
  providers: [PmTaskAttachmentRepository, PmTaskAttachmentService],
})
export class PmTaskAttachmentModule {}
