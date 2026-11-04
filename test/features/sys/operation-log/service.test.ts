import { buildSysOperationLogQueryOptions as getQueryOptions } from '@/features/sys/operation-log/controller'
import { describe, expect, test } from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'

const dialect = new PgDialect()

describe('SysOperationLogService.getQueryOptions', () => {
  test('没有查询条件时不生成 where', () => {
    expect(getQueryOptions({}).where).toBeUndefined()
  })

  test('映射 module 查询条件', () => {
    const where = getQueryOptions({ module: 'user' }).where
    expect(where).toBeDefined()
    expect(
      dialect
        .sqlToQuery(where!)
        .params.some((param) => String(param).includes(String('user')))
    ).toBe(true)
  })
})
