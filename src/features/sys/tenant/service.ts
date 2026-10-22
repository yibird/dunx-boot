import { CrudService } from '@/infra/crud'
import { sysTenant } from '@/schemas'
import { SysTenantRepository } from './repository'

export class SysTenantService extends CrudService<
  typeof sysTenant,
  SysTenantRepository
> {
  constructor(override readonly repository: SysTenantRepository) {
    super(repository)
  }
}
