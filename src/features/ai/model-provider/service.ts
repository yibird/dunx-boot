import { CrudService } from '@/infra/crud'
import type { AiModelProviderQuery } from './schema'
import { aiModelProvider } from '@/schemas'
import { AiModelProviderRepository } from './repository'

export class AiModelProviderService extends CrudService<
  typeof aiModelProvider,
  never,
  AiModelProviderRepository,
  Partial<AiModelProviderQuery>
> {
  constructor(
    protected override readonly repository: AiModelProviderRepository
  ) {
    super(repository)
  }
}
