import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { pmTaskLabelRel } from '@/schemas'

/**
 * 任务标签关联仓储层
 */
export class PmTaskLabelRelRepository extends CrudRepository<
  typeof pmTaskLabelRel
> {
  constructor() {
    super({
      table: pmTaskLabelRel,
      queryOptions: {
        orderBy: [asc(pmTaskLabelRel.id)],
      },
    })
  }
}
