import { asc, desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { pmTask } from '@/schemas'
import type { PmTaskQuery } from './model'

/**
 * 任务仓储层
 */
export class PmTaskRepository extends CrudRepository<typeof pmTask> {
  constructor() {
    super({
      table: pmTask,
      cache: true,
      defaultOrderBy: [asc(pmTask.sort), desc(pmTask.id)],
    })
  }

  override getQueryOptions(query: PmTaskQuery) {
    return {
      where: mergeAnd(
        eqIf(pmTask.projectId, query.projectId),
        eqIf(pmTask.parentId, query.parentId),
        ilikeIf(pmTask.title, query.title),
        eqIf(pmTask.status, query.status),
        eqIf(pmTask.priority, query.priority),
        eqIf(pmTask.assigneeId, query.assigneeId)
      ),
    }
  }
}
