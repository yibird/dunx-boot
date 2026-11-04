import { describe, expect, test } from 'bun:test'
import { eq, type SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { CrudRepository } from '@/infra/crud'
import { auditPlugin } from '@/infra/crud/repository/plugins/audit'
import { optimisticLockPlugin } from '@/infra/crud/repository/plugins/optimistic-lock'
import { softDeletePlugin } from '@/infra/crud/repository/plugins/soft-delete'
import { tenantPlugin } from '@/infra/crud/repository/plugins/tenant'
import { sessionContext, type SessionContext } from '@/infra/context'
import { sysDept } from '@/schemas'

const dialect = new PgDialect()
const actor: SessionContext = {
  userId: '9',
  account: 'tester',
  tenantId: '2',
}

interface Recorded {
  operation?: string
  where?: SQL
  orderBy?: unknown[]
  groupBy?: unknown[]
  limit?: number
  offset?: number
  values?: unknown
  set?: unknown
  selectColumns?: Record<string, unknown> | undefined
}

/** 记录链式调用，避免测试依赖真实数据库 */
function createFakeDb(rows: unknown[]) {
  const recorded: Recorded = {}

  const selection = () => {
    const chain = {
      from: () => chain,
      where: (where: SQL) => {
        recorded.where = where
        return chain
      },
      orderBy: (...orderBy: unknown[]) => {
        recorded.orderBy = orderBy
        return chain
      },
      groupBy: (...groupBy: unknown[]) => {
        recorded.groupBy = groupBy
        return chain
      },
      limit: (limit: number) => {
        recorded.limit = limit
        return chain
      },
      offset: (offset: number) => {
        recorded.offset = offset
        return chain
      },
      $dynamic: () => chain,
      then: (
        resolve: (value: unknown[]) => unknown,
        reject?: (error: unknown) => unknown
      ) => Promise.resolve(rows).then(resolve, reject),
    }
    return chain
  }

  const db = {
    select: (columns?: Record<string, unknown>) => {
      recorded.operation = 'select'
      recorded.selectColumns = columns
      return selection()
    },
    insert: () => {
      recorded.operation = 'insert'
      return {
        values: (values: unknown) => {
          recorded.values = values
          return { returning: async () => rows }
        },
      }
    },
    update: () => {
      recorded.operation = 'update'
      return {
        set: (values: unknown) => {
          recorded.set = values
          return {
            where: (where: SQL) => {
              recorded.where = where
              return { returning: async () => rows }
            },
          }
        },
      }
    },
    delete: () => {
      recorded.operation = 'delete'
      return {
        where: (where: SQL) => {
          recorded.where = where
          return { returning: async () => rows }
        },
      }
    },
  }

  return { db: db as unknown as BunSQLDatabase, recorded }
}

const row = {
  id: '1',
  tenantId: '2',
  deptName: '研发部',
  deleted: false,
  dataStatus: true,
  version: 1,
  sort: 0,
}

function createRepository(rows: unknown[] = [row]) {
  const { db, recorded } = createFakeDb(rows)
  const repository = new CrudRepository(
    {
      table: sysDept,
      queryOptions: {
        orderBy: [sysDept.sort],
        groupBy: [sysDept.parentId],
        where: eq(sysDept.dataStatus, true),
      },
      plugins: [
        tenantPlugin({ columnName: 'tenantId' }),
        softDeletePlugin({ columnName: 'deleted' }),
        auditPlugin(),
        optimisticLockPlugin({ columnName: 'version' }),
      ],
    },
    db
  )
  return { repository, recorded }
}

function asActor<T>(callback: () => T): T {
  return sessionContext.run(actor, callback)
}

function render(where?: SQL) {
  return where ? dialect.sqlToQuery(where) : undefined
}

describe('crud2 demo', () => {
  test('getPageList 合并默认条件与插件条件，并保留分页参数', async () => {
    const { repository, recorded } = createRepository()

    const result = await asActor(() =>
      repository.getPageList(
        { current: 2, pageSize: 20 },
        { orderBy: [sysDept.deptName] }
      )
    )

    expect(result).toEqual([row])
    expect(recorded.orderBy).toHaveLength(2)
    expect(recorded.groupBy).toHaveLength(1)
    expect(recorded.limit).toBe(20)
    expect(recorded.offset).toBe(20)

    const where = render(recorded.where)
    expect(where?.params).toContain('2')
    expect(where?.sql).toContain('"sys_dept"."tenant_id"')
    expect(where?.sql).toContain('"sys_dept"."deleted"')
    expect(where?.sql).toContain('"sys_dept"."data_status"')
  })

  test('findById 追加主键条件', async () => {
    const { repository, recorded } = createRepository()

    await asActor(() => repository.findById('1'))

    expect(render(recorded.where)?.params).toContain('1')
  })

  test('count 同样排除软删除记录', async () => {
    const { repository, recorded } = createRepository()

    await asActor(() => repository.count())

    expect(render(recorded.where)?.sql).toContain('"sys_dept"."deleted"')
  })

  test('create 填充租户、审计与版本号', async () => {
    const { repository, recorded } = createRepository()

    await asActor(() =>
      repository.create({ deptName: '研发部', rootId: '0', parentId: '0' })
    )

    expect(recorded.values).toMatchObject({
      deptName: '研发部',
      tenantId: '2',
      createBy: '9',
      creatorName: 'tester',
      version: 1,
    })
    expect(
      (recorded.values as Record<string, unknown>)['createdAt']
    ).toBeString()
  })

  test('createMany 逐条填充插件数据', async () => {
    const { repository, recorded } = createRepository()

    await asActor(() =>
      repository.createMany([
        { deptName: '研发部', rootId: '0', parentId: '0' },
        { deptName: '测试部', rootId: '0', parentId: '0' },
      ])
    )

    expect(recorded.values).toHaveLength(2)
    for (const value of recorded.values as Record<string, unknown>[]) {
      expect(value['tenantId']).toBe('2')
      expect(value['createBy']).toBe('9')
      expect(value['version']).toBe(1)
    }
  })

  test('update 校验版本、递增版本并填充更新人', async () => {
    const { repository, recorded } = createRepository()

    await asActor(() =>
      repository.update('1', { deptName: '新研发部', version: 3 })
    )

    expect(recorded.set).toMatchObject({
      deptName: '新研发部',
      updateBy: '9',
      updaterName: 'tester',
    })
    expect((recorded.set as Record<string, unknown>)['version']).toBeDefined()

    const where = render(recorded.where)
    expect(where?.sql).toContain('"sys_dept"."version"')
    expect(where?.params).toEqual(expect.arrayContaining(['1', 3, '2']))
  })

  test('delete 默认走软删除并填充删除审计字段', async () => {
    const { repository, recorded } = createRepository()

    await asActor(() => repository.delete('1'))

    expect(recorded.operation).toBe('update')
    expect(recorded.set).toMatchObject({
      deleted: true,
      deleteBy: '9',
      deleterName: 'tester',
    })
    // 软删除同样是一次更新，版本号需要递增
    expect((recorded.set as Record<string, unknown>)['version']).toBeDefined()
  })

  test('delete 显式物理删除', async () => {
    const { repository, recorded } = createRepository()

    await asActor(() => repository.delete('1', false))

    expect(recorded.operation).toBe('delete')
    expect(render(recorded.where)?.params).toContain('1')
  })

  test('缺少版本号时更新被拒绝', async () => {
    const { repository } = createRepository()

    await expect(
      asActor(() => repository.update('1', { deptName: '新研发部' }))
    ).rejects.toThrow('更新数据缺少版本号')
  })

  test('版本不匹配时抛出冲突错误', async () => {
    const { repository } = createRepository([])

    await expect(
      asActor(() =>
        repository.update('1', { deptName: '新研发部', version: 2 })
      )
    ).rejects.toThrow('数据已被修改，请刷新后重试')
  })

  test('ignoreColumns 只影响查询结果，不阻断写入', async () => {
    const { db, recorded } = createFakeDb([row])
    const repository = new CrudRepository(
      {
        table: sysDept,
        ignoreColumns: ['deptName', 'leaderName'],
        queryOptions: {},
      },
      db
    )

    await asActor(() =>
      repository.create({
        deptName: '研发部',
        rootId: '0',
        parentId: '0',
        leaderName: '张三',
      })
    )
    expect(recorded.values).toMatchObject({
      deptName: '研发部',
      leaderName: '张三',
    })

    await asActor(() =>
      repository.update('1', {
        deptName: '新研发部',
        leaderName: '李四',
        version: 1,
      })
    )
    expect(recorded.set).toMatchObject({
      deptName: '新研发部',
      leaderName: '李四',
    })

    await asActor(() => repository.getPageList({}))
    expect(recorded.selectColumns).not.toHaveProperty('deptName')
    expect(recorded.selectColumns).not.toHaveProperty('leaderName')
  })
})
