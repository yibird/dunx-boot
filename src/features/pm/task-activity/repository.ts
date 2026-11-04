import { desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { pmTaskActivity } from '@/schemas'

/**
 * 任务动态仓储层
 */
export class PmTaskActivityRepository extends CrudRepository<
  typeof pmTaskActivity
> {
  constructor() {
    super({
      table: pmTaskActivity,
      queryOptions: {
        orderBy: [desc(pmTaskActivity.id)],
      },
    })
  }
}
