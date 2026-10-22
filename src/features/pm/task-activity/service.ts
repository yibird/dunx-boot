import { CrudService } from '@/infra/crud'
import { pmTaskActivity } from '@/schemas'
import { PmTaskActivityRepository } from './repository'

/**
 * 任务动态业务层
 */
export class PmTaskActivityService extends CrudService<
  typeof pmTaskActivity,
  PmTaskActivityRepository
> {
  constructor(override readonly repository: PmTaskActivityRepository) {
    super(repository)
  }
}
