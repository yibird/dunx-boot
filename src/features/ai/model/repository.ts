import { asc, desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { aiModel } from '@/schemas'
import type { AiModelQuery } from './schema'

export class AiModelRepository extends CrudRepository<typeof aiModel> {
  constructor() {
    super({
      table: aiModel,
      tenant: { enabled: false },
      defaultOrderBy: [
        asc(aiModel.sort),
        desc(aiModel.createdAt),
        desc(aiModel.id),
      ],
    })
  }

  override getQueryOptions(query: Partial<AiModelQuery>) {
    return {
      where: mergeAnd(
        ilikeIf(aiModel.modelName, query.modelName),
        eqIf(aiModel.providerId, query.providerId),
        eqIf(aiModel.modelType, query.modelType)
      ),
    }
  }
}
