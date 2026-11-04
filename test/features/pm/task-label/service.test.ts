import { buildPmTaskLabelQueryOptions as getQueryOptions } from '@/features/pm/task-label/controller'
import { describe, expect, test } from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'

const dialect = new PgDialect()

describe('PmTaskLabelService.getQueryOptions', () => {
  test('没有查询条件时不生成 where', () => {
    expect(getQueryOptions({}).where).toBeUndefined()
  })

  test('映射 labelName 查询条件', () => {
    const where = getQueryOptions({ labelName: '标签' }).where
    expect(where).toBeDefined()
    expect(
      dialect
        .sqlToQuery(where!)
        .params.some((param) => String(param).includes(String('标签')))
    ).toBe(true)
  })
})
