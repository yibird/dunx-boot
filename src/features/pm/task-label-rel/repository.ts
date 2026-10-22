import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, mergeAnd } from '@/infra/db'
import { pmTaskLabelRel } from '@/schemas'
import type { PmTaskLabelRelQuery } from './model'

/**
 * 任务标签关联仓储层
 */
export class PmTaskLabelRelRepository extends CrudRepository<
  typeof pmTaskLabelRel
> {
  constructor() {
    super({
      table: pmTaskLabelRel,
      cache: true,
      defaultOrderBy: [asc(pmTaskLabelRel.id)],
    })
  }

  override getQueryOptions(query: PmTaskLabelRelQuery) {
    return {
      where: mergeAnd(
        eqIf(pmTaskLabelRel.taskId, query.taskId),
        eqIf(pmTaskLabelRel.labelId, query.labelId)
      ),
    }
  }
}
