import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, mergeAnd } from '@/infra/db'
import { pmTaskComment } from '@/schemas'
import type { PmTaskCommentQuery } from './model'

/**
 * 任务评论仓储层
 */
export class PmTaskCommentRepository extends CrudRepository<
  typeof pmTaskComment
> {
  constructor() {
    super({
      table: pmTaskComment,
      cache: true,
      defaultOrderBy: [asc(pmTaskComment.id)],
    })
  }

  override getQueryOptions(query: PmTaskCommentQuery) {
    return {
      where: mergeAnd(
        eqIf(pmTaskComment.taskId, query.taskId),
        eqIf(pmTaskComment.userId, query.userId),
        eqIf(pmTaskComment.parentId, query.parentId)
      ),
    }
  }
}
