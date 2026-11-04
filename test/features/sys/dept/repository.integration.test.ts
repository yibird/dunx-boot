import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { asc, eq, like } from 'drizzle-orm'
import { ConflictError } from '@/errors'
import { sessionContext, type SessionContext } from '@/infra/context'
import { createDb } from '@/infra/db/database/db'
import { CrudRepository } from '@/infra/crud'
import { relations, sysDept } from '@/schemas'

const databaseTests = Bun.env['DATABASE_URL'] ? describe : describe.skip
const prefix = `crud-it-${crypto.randomUUID().slice(0, 8)}`
const actor: SessionContext = {
  userId: '9001',
  account: 'integration-tester',
  tenantId: '1001',
}

const databaseUrl = Bun.env['DATABASE_URL']!

let db: Awaited<ReturnType<typeof createDb>>
let repository: CrudRepository<typeof sysDept>

function asActor<T>(callback: () => T): T {
  return sessionContext.run(actor, callback)
}

databaseTests('SysDeptRepository 真实 PostgreSQL 行为', () => {
  beforeAll(async () => {
    db = await createDb({
      url: databaseUrl,
      drizzle: { relations },
    })
    repository = new CrudRepository(
      {
        table: sysDept,
        queryOptions: {
          orderBy: [asc(sysDept.sort)],
        },
      },
      db
    )
  })

  afterAll(async () => {
    await db.delete(sysDept).where(like(sysDept.deptName, `${prefix}%`))
    await db.$client.close()
  })

  test('创建时自动填充租户与审计字段', async () => {
    const row = await asActor(() =>
      repository.create({ deptName: `${prefix}-研发部` })
    )

    expect(row.tenantId).toBe(actor.tenantId!)
    expect(row.createBy).toBe(actor.userId)
    expect(row.version).toBe(1)
    expect(row.deleted).toBe(false)
  })

  test('按主键查询并支持乐观锁更新', async () => {
    const created = await asActor(() =>
      repository.create({ deptName: `${prefix}-测试部` })
    )

    const found = await asActor(() => repository.findById(created.id))
    expect(found?.id).toBe(created.id)

    const updated = await asActor(() =>
      repository.update(created.id, {
        deptName: `${prefix}-测试部-改`,
        version: created.version,
      })
    )
    expect(updated.deptName).toBe(`${prefix}-测试部-改`)
    expect(updated.version).toBe(2)
    expect(updated.updateBy).toBe(actor.userId)

    await expect(
      asActor(() =>
        repository.update(created.id, {
          deptName: `${prefix}-并发`,
          version: 1,
        })
      )
    ).rejects.toBeInstanceOf(ConflictError)
  })

  test('分页与统计排除软删除记录', async () => {
    const alive = await asActor(() =>
      repository.create({ deptName: `${prefix}-在用` })
    )
    const removed = await asActor(() =>
      repository.create({ deptName: `${prefix}-待删` })
    )

    await asActor(() => repository.delete(removed.id))

    const rows = await asActor(() =>
      repository.getPageList({ current: 1, pageSize: 100 })
    )
    const ids = rows.map((row) => row.id)

    expect(ids).toContain(alive.id)
    expect(ids).not.toContain(removed.id)
    expect(await asActor(() => repository.count())).toBeGreaterThanOrEqual(1)
    expect(await asActor(() => repository.findById(removed.id))).toBeUndefined()
  })

  test('删除为软删除', async () => {
    const created = await asActor(() =>
      repository.create({ deptName: `${prefix}-安全删除` })
    )

    const deleted = await asActor(() => repository.delete(created.id))

    expect(deleted?.id).toBe(created.id)
    expect(deleted?.deleted).toBe(true)

    const remaining = await db
      .select()
      .from(sysDept)
      .where(eq(sysDept.id, created.id))
    expect(remaining).toHaveLength(1)
  })
})
