import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { inArray, like } from 'drizzle-orm'
import { sessionContext, type SessionContext } from '@/infra/context'
import { createDb } from '@/infra/db/database/db'
import { SysRoleRepository } from '@/features/sys/role/repository'
import { relations, sysMenu, sysRole, sysRoleMenu } from '@/schemas'
import { SYS_MENU_TYPE } from '@/constants'

const databaseTests = Bun.env['DATABASE_URL'] ? describe : describe.skip
const databaseUrl = Bun.env['DATABASE_URL']!
const prefix = `crud-it-role-${crypto.randomUUID().slice(0, 8)}`
const actor: SessionContext = {
  userId: '9201',
  account: 'role-integration',
  tenantId: '1201',
}

let db: Awaited<ReturnType<typeof createDb>>
let repository: SysRoleRepository
const roleIds: string[] = []
const menuIds: string[] = []

function asActor<T>(callback: () => T): T {
  return sessionContext.run(actor, callback)
}

databaseTests('SysRoleRepository 真实 PostgreSQL 行为', () => {
  beforeAll(async () => {
    db = await createDb({ url: databaseUrl, drizzle: { relations } })
    repository = new SysRoleRepository(db)
  })

  afterAll(async () => {
    if (roleIds.length) {
      await db.delete(sysRoleMenu).where(inArray(sysRoleMenu.roleId, roleIds))
    }
    if (menuIds.length) {
      await db.delete(sysMenu).where(inArray(sysMenu.id, menuIds))
    }
    await db.delete(sysRole).where(like(sysRole.roleName, `${prefix}%`))
    await db.$client.close()
  })

  test('getPermissions 去重并过滤空权限码', async () => {
    const role = await asActor(() =>
      repository.create({ roleName: `${prefix}-角色` })
    )
    roleIds.push(role.id)
    const menus = await db
      .insert(sysMenu)
      .values([
        {
          menuName: `${prefix}-菜单A`,
          menuType: SYS_MENU_TYPE.Menu,
          permission: 'sys:user:list',
          tenantId: actor.tenantId!,
        },
        {
          menuName: `${prefix}-菜单B`,
          menuType: SYS_MENU_TYPE.Permission,
          permission: 'sys:user:list',
          tenantId: actor.tenantId!,
        },
        {
          menuName: `${prefix}-菜单C`,
          menuType: SYS_MENU_TYPE.Permission,
          permission: '',
          tenantId: actor.tenantId!,
        },
        {
          menuName: `${prefix}-菜单D`,
          menuType: SYS_MENU_TYPE.Permission,
          permission: null,
          tenantId: actor.tenantId!,
        },
      ])
      .returning()

    menuIds.push(...menus.map((menu) => menu.id))

    await db.insert(sysRoleMenu).values(
      menus.map((menu) => ({
        roleId: role.id,
        menuId: menu.id,
        tenantId: actor.tenantId!,
      }))
    )

    const permissions = await asActor(() => repository.getPermissions(role.id))

    expect(permissions).toEqual(['sys:user:list'])
  })

  test('getPermissions 对空角色返回空数组', async () => {
    expect(await asActor(() => repository.getPermissions(undefined))).toEqual(
      []
    )
    expect(await asActor(() => repository.getPermissions(null))).toEqual([])
  })

  test('角色查询按名称模糊匹配', async () => {
    const name = `${prefix}-查询角色`
    await asActor(() => repository.create({ roleName: name }))

    const rows = await asActor(() =>
      repository.getMany({ where: like(sysRole.roleName, `%${name}%`) })
    )

    expect(rows.some((row) => row.roleName === name)).toBe(true)
  })
})
