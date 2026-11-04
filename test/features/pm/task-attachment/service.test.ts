import { buildPmTaskAttachmentQueryOptions as getQueryOptions } from '@/features/pm/task-attachment/controller'
import { describe, expect, test } from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'

const dialect = new PgDialect()

describe('PmTaskAttachmentService.getQueryOptions', () => {
  test('没有查询条件时不生成 where', () => {
    expect(getQueryOptions({}).where).toBeUndefined()
  })

  test('映射 taskId 查询条件', () => {
    const where = getQueryOptions({ taskId: 't1' }).where
    expect(where).toBeDefined()
    expect(
      dialect
        .sqlToQuery(where!)
        .params.some((param) => String(param).includes(String('t1')))
    ).toBe(true)
  })
})
