import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { pmTaskComment } from '@/schemas'

/**
 * 任务评论仓储层
 */
export class PmTaskCommentRepository extends CrudRepository<
  typeof pmTaskComment
> {
  constructor() {
    super({
      table: pmTaskComment,
      queryOptions: {
        orderBy: [asc(pmTaskComment.id)],
      },
    })
  }
}
