import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, mergeAnd } from '@/infra/db'
import { pmProjectMember } from '@/schemas'
import type { PmProjectMemberQuery } from './model'

/**
 * 项目成员仓储层
 */
export class PmProjectMemberRepository extends CrudRepository<
  typeof pmProjectMember
> {
  constructor() {
    super({
      table: pmProjectMember,
      cache: true,
      defaultOrderBy: [asc(pmProjectMember.id)],
    })
  }

  override getQueryOptions(query: PmProjectMemberQuery) {
    return {
      where: mergeAnd(
        eqIf(pmProjectMember.projectId, query.projectId),
        eqIf(pmProjectMember.userId, query.userId),
        eqIf(pmProjectMember.role, query.role)
      ),
    }
  }
}
