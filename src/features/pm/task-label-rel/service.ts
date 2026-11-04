import { CrudService } from '@/infra/crud'
import type { PmTaskLabelRelQuery } from './model'
import { pmTaskLabelRel } from '@/schemas'
import { PmTaskLabelRelRepository } from './repository'

/**
 * 任务标签关联业务层
 */
export class PmTaskLabelRelService extends CrudService<
  typeof pmTaskLabelRel,
  never,
  PmTaskLabelRelRepository,
  Partial<PmTaskLabelRelQuery>
> {
  constructor(override readonly repository: PmTaskLabelRelRepository) {
    super(repository)
  }
}
