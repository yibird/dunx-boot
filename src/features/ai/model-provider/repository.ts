import { asc, desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { ilikeIf, mergeAnd } from '@/infra/db'
import { aiModelProvider } from '@/schemas'
import type { AiModelProviderQuery } from './schema'

export class AiModelProviderRepository extends CrudRepository<
  typeof aiModelProvider
> {
  constructor() {
    super({
      table: aiModelProvider,
      tenant: { enabled: false },
      defaultOrderBy: [
        asc(aiModelProvider.sort),
        desc(aiModelProvider.createdAt),
        desc(aiModelProvider.id),
      ],
    })
  }

  override getQueryOptions(query: Partial<AiModelProviderQuery>) {
    return {
      where: mergeAnd(
        ilikeIf(aiModelProvider.providerCode, query.providerCode),
        ilikeIf(aiModelProvider.providerName, query.providerName)
      ),
    }
  }
}
