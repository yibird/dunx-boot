import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { sysTenant } from '@/schemas'

export class SysTenantRepository extends CrudRepository<typeof sysTenant> {
  constructor() {
    super({
      table: sysTenant,
      queryOptions: {
        orderBy: [asc(sysTenant.sort), asc(sysTenant.createdAt)],
      },
    })
  }
}
