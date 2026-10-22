import { CrudService } from '@/infra/crud'
import { pmTaskComment } from '@/schemas'
import { PmTaskCommentRepository } from './repository'

/**
 * 任务评论业务层
 */
export class PmTaskCommentService extends CrudService<
  typeof pmTaskComment,
  PmTaskCommentRepository
> {
  constructor(override readonly repository: PmTaskCommentRepository) {
    super(repository)
  }
}
