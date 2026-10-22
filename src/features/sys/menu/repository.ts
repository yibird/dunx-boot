import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { sysMenu } from '@/schemas'
import type { SysMenuQuery } from './schema'

export class SysMenuRepository extends CrudRepository<typeof sysMenu> {
  constructor() {
    super({
      table: sysMenu,
      cache: true,
      defaultOrderBy: [asc(sysMenu.sort), asc(sysMenu.createdAt)],
    })
  }

  override getQueryOptions(query: Partial<SysMenuQuery>) {
    return {
      where: mergeAnd(
        ilikeIf(sysMenu.menuName, query.menuName),
        eqIf(sysMenu.menuType, query.menuType),
        eqIf(sysMenu.parentId, query.parentId),
        ilikeIf(sysMenu.routePath, query.menuPath),
        ilikeIf(sysMenu.permission, query.permission)
      ),
    }
  }
}
