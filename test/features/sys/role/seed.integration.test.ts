import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { ilike } from 'drizzle-orm'
import { sessionContext, type SessionContext } from '@/infra/context'
import { createDb } from '@/infra/db/database/db'
import { SysRoleRepository } from '@/features/sys/role/repository'
import { relations, sysRole } from '@/schemas'

const databaseTests = Bun.env['DATABASE_URL'] ? describe : describe.skip
const databaseUrl = Bun.env['DATABASE_URL']!
const actor: SessionContext = {
  userId: '1',
  account: 'admin',
  tenantId: '1',
}

let db: Awaited<ReturnType<typeof createDb>>
let repository: SysRoleRepository

function asActor<T>(callback: () => T): T {
  return sessionContext.run(actor, callback)
}

databaseTests('sys/role 种子数据真实查询', () => {
  beforeAll(async () => {
    db = await createDb({ url: databaseUrl, drizzle: { relations } })
    repository = new SysRoleRepository(db)
  })

  afterAll(async () => {
    await db.$client.close()
  })

  test('按主键读取种子角色', async () => {
    const role = await asActor(() => repository.findById('1'))

    expect(role?.roleName).toBe('管理员')
    expect(role?.tenantId).toBe('1')
    expect(role?.deleted).toBe(false)
  })

  test('列表查询命中种子角色', async () => {
    const rows = await asActor(() =>
      repository.getMany({ where: ilike(sysRole.roleName, '%管理%') })
    )

    expect(rows.map((row) => row.roleName)).toContain('管理员')
  })

  test('分页查询返回租户 1 的角色', async () => {
    const rows = await asActor(() =>
      repository.getPageList({ current: 1, pageSize: 10 })
    )

    const names = rows.map((row) => row.roleName)
    expect(await asActor(() => repository.count())).toBeGreaterThanOrEqual(4)
    expect(names).toEqual(
      expect.arrayContaining(['管理员', '财务', '运营', '市场'])
    )
  })

  test('getPermissions 返回种子角色权限且去重', async () => {
    const permissions = await asActor(() => repository.getPermissions('1'))

    expect(permissions.length).toBeGreaterThan(0)
    expect(permissions).toContain('sys:user:getPageList')
    expect(new Set(permissions).size).toBe(permissions.length)
  })

  test('getPermissions 只返回当前角色的权限', async () => {
    const adminPermissions = await asActor(() => repository.getPermissions('1'))
    const financePermissions = await asActor(() =>
      repository.getPermissions('2')
    )

    expect(financePermissions.length).toBeLessThan(adminPermissions.length)
  })
})
