import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { sysMenu } from '@/schemas'

export class SysMenuRepository extends CrudRepository<typeof sysMenu> {
  constructor() {
    super({
      table: sysMenu,
      queryOptions: {
        orderBy: [asc(sysMenu.sort), asc(sysMenu.createdAt)],
      },
    })
  }
}
