import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { pmTaskLabel } from '@/schemas'
import type { PmTaskLabelQuery } from './model'

/**
 * 任务标签仓储层
 */
export class PmTaskLabelRepository extends CrudRepository<typeof pmTaskLabel> {
  constructor() {
    super({
      table: pmTaskLabel,
      cache: true,
      defaultOrderBy: [asc(pmTaskLabel.sort), asc(pmTaskLabel.id)],
    })
  }

  override getQueryOptions(query: PmTaskLabelQuery) {
    return {
      where: mergeAnd(
        eqIf(pmTaskLabel.projectId, query.projectId),
        ilikeIf(pmTaskLabel.labelName, query.labelName)
      ),
    }
  }
}
