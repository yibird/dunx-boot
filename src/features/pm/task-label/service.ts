import { CrudService } from '@/infra/crud'
import { pmTaskLabel } from '@/schemas'
import { PmTaskLabelRepository } from './repository'

/**
 * 任务标签业务层
 */
export class PmTaskLabelService extends CrudService<
  typeof pmTaskLabel,
  PmTaskLabelRepository
> {
  constructor(override readonly repository: PmTaskLabelRepository) {
    super(repository)
  }
}
