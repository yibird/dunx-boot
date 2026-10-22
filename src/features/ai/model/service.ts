import { CrudService } from '@/infra/crud'
import { aiModel } from '@/schemas'
import { AiModelRepository } from './repository'

export class AiModelService extends CrudService<
  typeof aiModel,
  AiModelRepository
> {
  constructor(protected override readonly repository: AiModelRepository) {
    super(repository)
  }
}
