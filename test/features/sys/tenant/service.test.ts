import { buildSysTenantQueryOptions as getQueryOptions } from '@/features/sys/tenant/controller'
import { describe, expect, test } from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'

const dialect = new PgDialect()

describe('SysTenantService.getQueryOptions', () => {
  test('没有查询条件时不生成 where', () => {
    expect(getQueryOptions({}).where).toBeUndefined()
  })

  test('映射 tenantName 查询条件', () => {
    const where = getQueryOptions({ tenantName: '租户' }).where
    expect(where).toBeDefined()
    expect(
      dialect
        .sqlToQuery(where!)
        .params.some((param) => String(param).includes(String('租户')))
    ).toBe(true)
  })
})
