import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { pmProjectMember } from '@/schemas'

/**
 * 项目成员仓储层
 */
export class PmProjectMemberRepository extends CrudRepository<
  typeof pmProjectMember
> {
  constructor() {
    super({
      table: pmProjectMember,
      queryOptions: {
        orderBy: [asc(pmProjectMember.id)],
      },
    })
  }
}
