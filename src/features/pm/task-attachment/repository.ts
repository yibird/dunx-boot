import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { pmTaskAttachment } from '@/schemas'

/**
 * 任务附件仓储层
 */
export class PmTaskAttachmentRepository extends CrudRepository<
  typeof pmTaskAttachment
> {
  constructor() {
    super({
      table: pmTaskAttachment,
      queryOptions: {
        orderBy: [asc(pmTaskAttachment.id)],
      },
    })
  }
}
