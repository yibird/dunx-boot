import { buildSysDictTypeQueryOptions as getQueryOptions } from '@/features/sys/dict-type/controller'
import { describe, expect, test } from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'

const dialect = new PgDialect()

describe('SysDictTypeService.getQueryOptions', () => {
  test('没有查询条件时不生成 where', () => {
    expect(getQueryOptions({}).where).toBeUndefined()
  })

  test('映射 dictName 查询条件', () => {
    const where = getQueryOptions({ dictName: '状态' }).where
    expect(where).toBeDefined()
    expect(
      dialect
        .sqlToQuery(where!)
        .params.some((param) => String(param).includes(String('状态')))
    ).toBe(true)
  })
})
