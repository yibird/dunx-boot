import { buildSysMessageQueryOptions as getQueryOptions } from '@/features/sys/message/controller'
import { describe, expect, test } from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'

const dialect = new PgDialect()

describe('SysMessageService.getQueryOptions', () => {
  test('没有查询条件时不生成 where', () => {
    expect(getQueryOptions({}).where).toBeUndefined()
  })

  test('映射 title 查询条件', () => {
    const where = getQueryOptions({ title: '消息' }).where
    expect(where).toBeDefined()
    expect(
      dialect
        .sqlToQuery(where!)
        .params.some((param) => String(param).includes(String('消息')))
    ).toBe(true)
  })
})
