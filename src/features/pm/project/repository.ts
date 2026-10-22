import { asc, desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { pmProject } from '@/schemas'
import type { PmProjectQuery } from './model'

/**
 * 项目仓储层
 */
export class PmProjectRepository extends CrudRepository<typeof pmProject> {
  constructor() {
    super({
      table: pmProject,
      cache: true,
      defaultOrderBy: [asc(pmProject.sort), desc(pmProject.id)],
    })
  }

  override getQueryOptions(query: PmProjectQuery) {
    return {
      where: mergeAnd(
        ilikeIf(pmProject.projectName, query.projectName),
        eqIf(pmProject.status, query.status),
        eqIf(pmProject.priority, query.priority),
        eqIf(pmProject.ownerId, query.ownerId)
      ),
    }
  }
}
