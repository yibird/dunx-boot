import { describe, expect, test } from 'bun:test'
import { eq } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'
import type { CrudPlugin } from '@/infra/crud/repository/plugin'
import type {
  CreateContext,
  DeleteContext,
  QueryContext,
  UpdateContext,
} from '@/infra/crud/repository/types'
import { PluginManager } from '@/infra/crud/repository/plugin'
import { tenantPlugin } from '@/infra/crud/repository/plugins/tenant'
import { softDeletePlugin } from '@/infra/crud/repository/plugins/soft-delete'
import { auditPlugin } from '@/infra/crud/repository/plugins/audit'
import { optimisticLockPlugin } from '@/infra/crud/repository/plugins/optimistic-lock'
import { sessionContext, type SessionContext } from '@/infra/context'
import { sysDept } from '@/schemas'

const dialect = new PgDialect()
const session: SessionContext = {
  userId: '999',
  account: 'tester',
  tenantId: '100',
}

function asActor<T>(callback: () => T): T {
  return sessionContext.run(session, callback)
}

/** 构造一个最小的创建上下文，值对象由调用方持有以便断言 */
function createContext(values: Record<string, unknown>): CreateContext {
  return {
    table: sysDept,
    db: {} as never,
    operation: 'create',
    metadata: new Map(),
    values,
    input: {},
  }
}

describe('PluginManager', () => {
  test('按 priority 升序执行插件', async () => {
    const order: string[] = []
    const makePlugin = (name: string, priority: number): CrudPlugin => ({
      name,
      priority,
      beforeCreate(context) {
        order.push(name)
        ;(context.values as Record<string, unknown>)[name] = true
      },
    })

    const values: Record<string, unknown> = {}
    const context = createContext(values)
    const manager = new PluginManager([
      makePlugin('third', 30),
      makePlugin('first', 10),
      makePlugin('second', 20),
    ])

    await manager.beforeCreate(context)

    expect(order).toEqual(['first', 'second', 'third'])
    expect(values).toEqual({ first: true, second: true, third: true })
  })

  test('插件之间可以通过 metadata 传递数据', async () => {
    const producer: CrudPlugin = {
      name: 'producer',
      priority: 10,
      beforeCreate(context) {
        context.metadata.set('shared', 'value')
      },
    }
    const consumer: CrudPlugin = {
      name: 'consumer',
      priority: 20,
      beforeCreate(context) {
        ;(context.values as Record<string, unknown>)['received'] =
          context.metadata.get('shared')
      },
    }

    const values: Record<string, unknown> = {}
    const manager = new PluginManager([producer, consumer])

    await manager.beforeCreate(createContext(values))

    expect(values).toEqual({ received: 'value' })
  })
})

describe('tenantPlugin', () => {
  test('查询时追加租户条件', async () => {
    const plugin = tenantPlugin({ columnName: 'tenantId' })
    const context: QueryContext = {
      table: sysDept,
      db: {} as never,
      operation: 'query',
      metadata: new Map(),
      options: {},
      query: {},
    }

    asActor(() => plugin.beforeQuery?.(context))

    const query = dialect.sqlToQuery(context.options.where!)
    expect(query.sql).toBe('"sys_dept"."tenant_id" = $1')
    expect(query.params).toEqual(['100'])
  })

  test('创建时填充租户 ID', async () => {
    const plugin = tenantPlugin({ columnName: 'tenantId' })
    const values: Record<string, unknown> = { deptName: '研发部' }

    asActor(() => plugin.beforeCreate?.(createContext(values)))

    expect(values).toEqual({ deptName: '研发部', tenantId: '100' })
  })

  test('忽略清单中的表不追加条件', async () => {
    const plugin = tenantPlugin({ ignoreTables: ['sys_dept'] })
    const context: QueryContext = {
      table: sysDept,
      db: {} as never,
      operation: 'query',
      metadata: new Map(),
      options: {},
      query: {},
    }

    asActor(() => plugin.beforeQuery?.(context))

    expect(context.options.where).toBeUndefined()
  })
})

describe('softDeletePlugin', () => {
  test('删除转为软删除写入标记字段', async () => {
    const plugin = softDeletePlugin({ columnName: 'deleted' })
    const context: DeleteContext<typeof sysDept> = {
      table: sysDept,
      db: {} as never,
      operation: 'delete',
      metadata: new Map(),
      id: '123',
      where: eq(sysDept.id, '123'),
    }

    await plugin.beforeDelete?.(context)

    expect(context.softDelete).toBe(true)
    expect(context.values).toEqual({ deleted: true })
  })

  test('显式物理删除时不改写', async () => {
    const plugin = softDeletePlugin({ columnName: 'deleted' })
    const context: DeleteContext<typeof sysDept> = {
      table: sysDept,
      db: {} as never,
      operation: 'delete',
      metadata: new Map(),
      id: '123',
      softDelete: false,
    }

    await plugin.beforeDelete?.(context)

    expect(context.softDelete).toBe(false)
    expect(context.values).toBeUndefined()
  })

  test('查询时过滤已删除记录', async () => {
    const plugin = softDeletePlugin({ columnName: 'deleted' })
    const context: QueryContext = {
      table: sysDept,
      db: {} as never,
      operation: 'query',
      metadata: new Map(),
      options: {},
      query: {},
    }

    await plugin.beforeQuery?.(context)

    expect(dialect.sqlToQuery(context.options.where!).sql).toBe(
      '"sys_dept"."deleted" = $1'
    )
  })

  test('count 操作同样过滤软删除记录', async () => {
    const plugin = softDeletePlugin({ columnName: 'deleted' })
    const context: QueryContext = {
      table: sysDept,
      db: {} as never,
      operation: 'count',
      metadata: new Map(),
      options: {},
      query: {},
    }

    await plugin.beforeQuery?.(context)

    expect(dialect.sqlToQuery(context.options.where!).sql).toBe(
      '"sys_dept"."deleted" = $1'
    )
  })
})

describe('auditPlugin', () => {
  test('创建时填充创建审计字段', async () => {
    const plugin = auditPlugin()
    const values: Record<string, unknown> = { deptName: '研发部' }

    asActor(() => plugin.beforeCreate?.(createContext(values)))

    expect(values['createBy']).toBe('999')
    expect(values['creatorName']).toBe('tester')
    expect(values['createdAt']).toBeString()
  })

  test('更新时填充更新审计字段', async () => {
    const plugin = auditPlugin()
    const context: UpdateContext<typeof sysDept> = {
      table: sysDept,
      db: {} as never,
      operation: 'update',
      metadata: new Map(),
      id: '1',
      values: { deptName: '研发部' },
      input: {},
    }

    asActor(() => plugin.beforeUpdate?.(context))

    expect(context.values['updateBy']).toBe('999')
    expect(context.values['updaterName']).toBe('tester')
    expect(context.values['updatedAt']).toBeString()
  })

  test('软删除时填充删除审计字段', async () => {
    const plugin = auditPlugin()
    const context: DeleteContext<typeof sysDept> = {
      table: sysDept,
      db: {} as never,
      operation: 'delete',
      metadata: new Map(),
      id: '1',
      softDelete: true,
      values: {},
    }

    asActor(() => plugin.beforeDelete?.(context))

    expect(context.values?.['deleteBy']).toBe('999')
    expect(context.values?.['deleterName']).toBe('tester')
    expect(context.values?.['deletedAt']).toBeString()
  })
})

describe('optimisticLockPlugin', () => {
  test('创建时初始化版本号为 1', async () => {
    const plugin = optimisticLockPlugin()
    const values: Record<string, unknown> = { deptName: '研发部' }

    await plugin.beforeCreate?.(createContext(values))

    expect(values['version']).toBe(1)
  })

  test('更新时校验版本并递增', async () => {
    const plugin = optimisticLockPlugin()
    const context: UpdateContext<typeof sysDept> = {
      table: sysDept,
      db: {} as never,
      operation: 'update',
      metadata: new Map(),
      id: '1',
      values: { deptName: '研发部' },
      where: eq(sysDept.id, '1'),
      input: { version: 3 },
    }

    await plugin.beforeUpdate?.(context)

    const query = dialect.sqlToQuery(context.where!)
    expect(query.sql).toBe(
      '(("sys_dept"."id" = $1) and ("sys_dept"."version" = $2))'
    )
    expect(query.params).toEqual(['1', 3])
    expect(context.values['version']).toBeDefined()
  })

  test('缺少版本号时抛出冲突错误', async () => {
    const plugin = optimisticLockPlugin()
    const context: UpdateContext<typeof sysDept> = {
      table: sysDept,
      db: {} as never,
      operation: 'update',
      metadata: new Map(),
      id: '1',
      values: { deptName: '研发部' },
      input: {},
    }

    expect(() => plugin.beforeUpdate?.(context)).toThrow('更新数据缺少版本号')
  })
})
