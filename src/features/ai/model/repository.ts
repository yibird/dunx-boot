import { asc, desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { aiModel } from '@/schemas'

export class AiModelRepository extends CrudRepository<typeof aiModel> {
  constructor() {
    super({
      table: aiModel,
      queryOptions: {
        orderBy: [asc(aiModel.sort), desc(aiModel.createdAt), desc(aiModel.id)],
      },
    })
  }
}
