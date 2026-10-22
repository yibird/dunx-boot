import { CrudService } from '@/infra/crud'
import { pmTask } from '@/schemas'
import { PmTaskRepository } from './repository'

/**
 * 任务业务层
 */
export class PmTaskService extends CrudService<
  typeof pmTask,
  PmTaskRepository
> {
  constructor(override readonly repository: PmTaskRepository) {
    super(repository)
  }
}
