import { CrudService } from '@/infra/crud'
import type { SysTenantQuery } from './schema'
import { sysTenant } from '@/schemas'
import { SysTenantRepository } from './repository'

export class SysTenantService extends CrudService<
  typeof sysTenant,
  never,
  SysTenantRepository,
  Partial<SysTenantQuery>
> {
  constructor(override readonly repository: SysTenantRepository) {
    super(repository)
  }
}
