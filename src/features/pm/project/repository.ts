import { asc, desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { pmProject } from '@/schemas'

/**
 * 项目仓储层
 */
export class PmProjectRepository extends CrudRepository<typeof pmProject> {
  constructor() {
    super({
      table: pmProject,
      queryOptions: {
        orderBy: [asc(pmProject.sort), desc(pmProject.id)],
      },
    })
  }
}
