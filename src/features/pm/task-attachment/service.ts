import { CrudService } from '@/infra/crud'
import type { PmTaskAttachmentQuery } from './model'
import { pmTaskAttachment } from '@/schemas'
import { PmTaskAttachmentRepository } from './repository'

/**
 * 任务附件业务层
 */
export class PmTaskAttachmentService extends CrudService<
  typeof pmTaskAttachment,
  never,
  PmTaskAttachmentRepository,
  Partial<PmTaskAttachmentQuery>
> {
  constructor(override readonly repository: PmTaskAttachmentRepository) {
    super(repository)
  }
}
