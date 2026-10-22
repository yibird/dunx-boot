import { CrudService } from '@/infra/crud'
import { pmTaskAttachment } from '@/schemas'
import { PmTaskAttachmentRepository } from './repository'

/**
 * 任务附件业务层
 */
export class PmTaskAttachmentService extends CrudService<
  typeof pmTaskAttachment,
  PmTaskAttachmentRepository
> {
  constructor(override readonly repository: PmTaskAttachmentRepository) {
    super(repository)
  }
}
