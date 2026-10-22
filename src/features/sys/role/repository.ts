import { asc, eq, isNotNull, ne } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, ilikeIf, mergeAnd, withTenant } from '@/infra/db'
import { sysMenu, sysRole, sysRoleMenu } from '@/schemas'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import type { SysRoleQuery } from './schema'

export class SysRoleRepository extends CrudRepository<typeof sysRole> {
  constructor(readonly db: BunSQLDatabase) {
    super({
      table: sysRole,
      cache: true,
      defaultOrderBy: [asc(sysRole.sort), asc(sysRole.createdAt)],
    })
  }

  override getQueryOptions(query: SysRoleQuery) {
    const where = mergeAnd(
      ilikeIf(sysRole.roleName, query.roleName),
      eqIf(sysRole.dataScope, query.dataScope)
    )
    return { where }
  }

  /**
   * 根据角色ID查询权限
   *
   * @param roleId 角色ID
   * @returns 权限列表
   */
  async getPermissions(roleId?: string | null) {
    if (!roleId) return []
    const rows = await this.db
      .selectDistinct({ permission: sysMenu.permission })
      .from(sysRoleMenu)
      .innerJoin(sysRole, eq(sysRoleMenu.roleId, sysRole.id))
      .innerJoin(sysMenu, eq(sysRoleMenu.menuId, sysMenu.id))
      .where(
        mergeAnd(
          eq(sysRoleMenu.roleId, roleId),
          withTenant(sysRoleMenu.tenantId),
          eq(sysRoleMenu.deleted, false),
          eq(sysRoleMenu.dataStatus, true),
          withTenant(sysRole.tenantId),
          eq(sysRole.deleted, false),
          eq(sysRole.dataStatus, true),
          withTenant(sysMenu.tenantId),
          eq(sysMenu.deleted, false),
          eq(sysMenu.dataStatus, true),
          isNotNull(sysMenu.permission),
          ne(sysMenu.permission, '')
        )
      )
    return rows.map(({ permission }) => permission!)
  }
}
