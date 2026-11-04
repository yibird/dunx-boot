import { CrudService } from '@/infra/crud'
import type { AiModelQuery } from './schema'
import { aiModel } from '@/schemas'
import { AiModelRepository } from './repository'

export class AiModelService extends CrudService<
  typeof aiModel,
  never,
  AiModelRepository,
  Partial<AiModelQuery>
> {
  constructor(protected override readonly repository: AiModelRepository) {
    super(repository)
  }
}
