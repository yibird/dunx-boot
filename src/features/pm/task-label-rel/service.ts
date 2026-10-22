import { CrudService } from '@/infra/crud'
import { pmTaskLabelRel } from '@/schemas'
import { PmTaskLabelRelRepository } from './repository'

/**
 * 任务标签关联业务层
 */
export class PmTaskLabelRelService extends CrudService<
  typeof pmTaskLabelRel,
  PmTaskLabelRelRepository
> {
  constructor(override readonly repository: PmTaskLabelRelRepository) {
    super(repository)
  }
}
