import { CrudService } from '@/infra/crud'
import type { PmTaskQuery } from './model'
import { pmTask } from '@/schemas'
import { PmTaskRepository } from './repository'

/**
 * 任务业务层
 */
export class PmTaskService extends CrudService<
  typeof pmTask,
  never,
  PmTaskRepository,
  Partial<PmTaskQuery>
> {
  constructor(override readonly repository: PmTaskRepository) {
    super(repository)
  }
}
