import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { sysTenant } from '@/schemas'
import { ilikeIf, mergeAnd } from '@/infra/db'
import type { SysTenantQuery } from './schema'

export class SysTenantRepository extends CrudRepository<typeof sysTenant> {
  constructor() {
    super({
      table: sysTenant,
      cache: true,
      defaultOrderBy: [asc(sysTenant.sort), asc(sysTenant.createdAt)],
    })
  }

  override getQueryOptions(query: SysTenantQuery) {
    return {
      where: mergeAnd(
        ilikeIf(sysTenant.tenantName, query.tenantName),
        ilikeIf(sysTenant.phone, query.phone),
        ilikeIf(sysTenant.contact, query.contact),
        ilikeIf(sysTenant.email, query.email)
      ),
    }
  }
}
