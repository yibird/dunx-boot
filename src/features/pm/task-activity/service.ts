import { CrudService } from '@/infra/crud'
import type { PmTaskActivityQuery } from './model'
import { pmTaskActivity } from '@/schemas'
import { PmTaskActivityRepository } from './repository'

/**
 * 任务动态业务层
 */
export class PmTaskActivityService extends CrudService<
  typeof pmTaskActivity,
  never,
  PmTaskActivityRepository,
  Partial<PmTaskActivityQuery>
> {
  constructor(override readonly repository: PmTaskActivityRepository) {
    super(repository)
  }
}
