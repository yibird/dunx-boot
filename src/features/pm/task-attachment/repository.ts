import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, mergeAnd } from '@/infra/db'
import { pmTaskAttachment } from '@/schemas'
import type { PmTaskAttachmentQuery } from './model'

/**
 * 任务附件仓储层
 */
export class PmTaskAttachmentRepository extends CrudRepository<
  typeof pmTaskAttachment
> {
  constructor() {
    super({
      table: pmTaskAttachment,
      cache: true,
      defaultOrderBy: [asc(pmTaskAttachment.id)],
    })
  }

  override getQueryOptions(query: PmTaskAttachmentQuery) {
    return {
      where: mergeAnd(
        eqIf(pmTaskAttachment.taskId, query.taskId),
        eqIf(pmTaskAttachment.fileId, query.fileId)
      ),
    }
  }
}
