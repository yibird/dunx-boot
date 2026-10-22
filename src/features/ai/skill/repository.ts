import { asc, desc } from 'drizzle-orm'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { CrudRepository } from '@/infra/crud'
import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { aiSkill } from '@/schemas'
import type { AiSkillQuery } from './schema'

export class AiSkillRepository extends CrudRepository<typeof aiSkill> {
  constructor(private readonly database: BunSQLDatabase) {
    super(
      {
        table: aiSkill,
        tenant: { enabled: false },
        defaultOrderBy: [
          asc(aiSkill.sort),
          desc(aiSkill.createdAt),
          desc(aiSkill.id),
        ],
      },
      database
    )
  }

  override getQueryOptions(query: Partial<AiSkillQuery>) {
    return {
      where: mergeAnd(
        ilikeIf(aiSkill.name, query.name),
        eqIf(aiSkill.visibility, query.visibility),
        eqIf(aiSkill.dataStatus, query.dataStatus)
      ),
    }
  }
}
