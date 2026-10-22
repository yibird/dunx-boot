import { desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, mergeAnd } from '@/infra/db'
import { pmTaskActivity } from '@/schemas'
import type { PmTaskActivityQuery } from './model'

/**
 * 任务动态仓储层
 */
export class PmTaskActivityRepository extends CrudRepository<
  typeof pmTaskActivity
> {
  constructor() {
    super({
      table: pmTaskActivity,
      cache: true,
      defaultOrderBy: [desc(pmTaskActivity.id)],
    })
  }

  override getQueryOptions(query: PmTaskActivityQuery) {
    return {
      where: mergeAnd(
        eqIf(pmTaskActivity.projectId, query.projectId),
        eqIf(pmTaskActivity.taskId, query.taskId),
        eqIf(pmTaskActivity.userId, query.userId),
        eqIf(pmTaskActivity.action, query.action)
      ),
    }
  }
}
