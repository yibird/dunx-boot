import { buildSysRoleQueryOptions as getQueryOptions } from '@/features/sys/role/controller'
import { describe, expect, test } from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'

const dialect = new PgDialect()

describe('SysRoleService.getQueryOptions', () => {
  test('没有查询条件时不生成 where', () => {
    expect(getQueryOptions({}).where).toBeUndefined()
  })

  test('映射 roleName 查询条件', () => {
    const where = getQueryOptions({ roleName: '管理员' }).where
    expect(where).toBeDefined()
    expect(
      dialect
        .sqlToQuery(where!)
        .params.some((param) => String(param).includes(String('管理员')))
    ).toBe(true)
  })
})
