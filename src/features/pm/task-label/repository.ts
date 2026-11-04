import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { pmTaskLabel } from '@/schemas'

/**
 * 任务标签仓储层
 */
export class PmTaskLabelRepository extends CrudRepository<typeof pmTaskLabel> {
  constructor() {
    super({
      table: pmTaskLabel,
      queryOptions: {
        orderBy: [asc(pmTaskLabel.sort), asc(pmTaskLabel.id)],
      },
    })
  }
}
