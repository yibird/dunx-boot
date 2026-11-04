import { asc, desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { pmTask } from '@/schemas'

/**
 * 任务仓储层
 */
export class PmTaskRepository extends CrudRepository<typeof pmTask> {
  constructor() {
    super({
      table: pmTask,
      queryOptions: {
        orderBy: [asc(pmTask.sort), desc(pmTask.id)],
      },
    })
  }
}
