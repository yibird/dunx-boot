import { asc, desc } from 'drizzle-orm'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { CrudRepository } from '@/infra/crud'
import { aiSkill } from '@/schemas'

export class AiSkillRepository extends CrudRepository<typeof aiSkill> {
  constructor(private readonly database: BunSQLDatabase) {
    super(
      {
        table: aiSkill,
        queryOptions: {
          orderBy: [
            asc(aiSkill.sort),
            desc(aiSkill.createdAt),
            desc(aiSkill.id),
          ],
        },
      },
      database
    )
  }
}
