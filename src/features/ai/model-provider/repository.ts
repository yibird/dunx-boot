import { asc, desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { aiModelProvider } from '@/schemas'

export class AiModelProviderRepository extends CrudRepository<
  typeof aiModelProvider
> {
  constructor() {
    super({
      table: aiModelProvider,
      queryOptions: {
        orderBy: [
          asc(aiModelProvider.sort),
          desc(aiModelProvider.createdAt),
          desc(aiModelProvider.id),
        ],
      },
    })
  }
}
