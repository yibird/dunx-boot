import { CrudService } from '@/infra/crud'
import type { PmTaskLabelQuery } from './model'
import { pmTaskLabel } from '@/schemas'
import { PmTaskLabelRepository } from './repository'

/**
 * 任务标签业务层
 */
export class PmTaskLabelService extends CrudService<
  typeof pmTaskLabel,
  never,
  PmTaskLabelRepository,
  Partial<PmTaskLabelQuery>
> {
  constructor(override readonly repository: PmTaskLabelRepository) {
    super(repository)
  }
}
