import { CrudService } from '@/infra/crud'
import { aiModelProvider } from '@/schemas'
import { AiModelProviderRepository } from './repository'

export class AiModelProviderService extends CrudService<
  typeof aiModelProvider,
  AiModelProviderRepository
> {
  constructor(
    protected override readonly repository: AiModelProviderRepository
  ) {
    super(repository)
  }
}
