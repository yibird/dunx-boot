import { describe, expect, test } from 'bun:test'
import { PgDialect } from 'drizzle-orm/pg-core'
import {
  withAuditValues,
  withAudit,
  withTenantValues,
  withFilteredFields,
  withVersionIncrement,
  withDeleted,
  withNotDeleted,
  withSoftDeleteValue,
  withTenantValue,
  withVersion,
} from '@/infra/db'
import { sessionContext } from '@/infra/context'
import { DEFAULT_TENANT_ID } from '@/constants'
import { sysDept } from '@/schemas'

const dialect = new PgDialect()
const session = {
  userId: '9',
  account: 'tester',
  tenantId: '2',
}

function sqlOf(condition: ReturnType<typeof withNotDeleted>) {
  return dialect.sqlToQuery(condition)
}

describe('withAuditValues', () => {
  test('创建时填充时间和操作人', () => {
    const values = sessionContext.run(session, () =>
      withAuditValues('create', { now: '2026-10-30 10:00:00' })
    )

    expect(values).toEqual({
      createdAt: '2026-10-30 10:00:00',
      createBy: '9',
      creatorName: 'tester',
    })
  })

  test('更新与删除使用各自的列', () => {
    const updated = sessionContext.run(session, () =>
      withAuditValues('update', { now: '2026-10-30 10:00:00' })
    )
    const deleted = sessionContext.run(session, () =>
      withAuditValues('delete', { now: '2026-10-30 10:00:00' })
    )

    expect(updated).toMatchObject({ updateBy: '9', updaterName: 'tester' })
    expect(deleted).toMatchObject({ deleteBy: '9', deleterName: 'tester' })
  })

  test('支持自定义列名与显式操作人', () => {
    const values = withAuditValues('create', {
      now: '2026-10-30 10:00:00',
      actor: { userId: '1', account: 'admin' },
      columns: { createdAt: 'created_at', createdBy: 'created_by' },
    })

    expect(values).toMatchObject({
      created_at: '2026-10-30 10:00:00',
      created_by: '1',
    })
  })

  test('withAudit 原地写入并返回原对象', () => {
    const input: Record<string, unknown> = { deptName: '研发部' }
    const values = sessionContext.run(session, () =>
      withAudit(input, 'create', { now: '2026-10-30 10:00:00' })
    )

    expect(values['deptName']).toBe('研发部')
    expect(values['createBy']).toBe('9')
  })
})

describe('soft delete', () => {
  test('生成未删除条件', () => {
    expect(sqlOf(withNotDeleted(sysDept.deleted))).toEqual({
      sql: '"sys_dept"."deleted" = $1',
      params: [false],
    })
  })

  test('生成已删除条件', () => {
    expect(sqlOf(withDeleted(sysDept.deleted))).toEqual({
      sql: '"sys_dept"."deleted" = $1',
      params: [true],
    })
  })

  test('生成软删除写入值', () => {
    expect(withSoftDeleteValue()).toEqual({ deleted: true })
    expect(
      withSoftDeleteValue({ columnName: 'is_deleted', deletedValue: 1 })
    ).toEqual({ is_deleted: 1 })
  })
})

describe('tenant', () => {
  test('withTenantValue 优先使用会话租户', () => {
    expect(sessionContext.run(session, () => withTenantValue())).toEqual({
      tenantId: '2',
    })
  })

  test('withTenantValues 不覆盖显式指定的租户', () => {
    const values = sessionContext.run(session, () =>
      withTenantValues({ tenantId: '99' })
    )

    expect(values).toEqual({ tenantId: '99' })
  })

  test('无会话时回退默认租户', () => {
    expect(withTenantValue()).toEqual({ tenantId: DEFAULT_TENANT_ID })
  })
})

describe('optimistic lock', () => {
  test('生成版本匹配条件', () => {
    expect(sqlOf(withVersion(sysDept.version, 3))).toEqual({
      sql: '"sys_dept"."version" = $1',
      params: [3],
    })
  })

  test('生成版本递增表达式', () => {
    expect(dialect.sqlToQuery(withVersionIncrement(sysDept.version))).toEqual({
      sql: '"sys_dept"."version" + 1',
      params: [],
    })
  })
})

describe('withFilteredFields', () => {
  test('移除禁止写入的字段且不修改入参', () => {
    const input = { id: '1', deptName: '研发部', tenantId: '2' }
    const result = withFilteredFields(input, ['id', 'tenantId'])

    expect(result).toEqual({ deptName: '研发部' })
    expect(input).toEqual({ id: '1', deptName: '研发部', tenantId: '2' })
  })

  test('没有需要过滤的字段时返回副本', () => {
    const input = { deptName: '研发部' }
    const result = withFilteredFields(input, [])

    expect(result).toEqual(input)
    expect(result).not.toBe(input)
  })
})
