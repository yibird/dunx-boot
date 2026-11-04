import { buildPmProjectQueryOptions as getQueryOptions } from '@/features/pm/project/controller'
import { describe, expect, test } from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'

const dialect = new PgDialect()

describe('PmProjectService.getQueryOptions', () => {
  test('没有查询条件时不生成 where', () => {
    expect(getQueryOptions({}).where).toBeUndefined()
  })

  test('映射 projectName 查询条件', () => {
    const where = getQueryOptions({ projectName: '项目' }).where
    expect(where).toBeDefined()
    expect(
      dialect
        .sqlToQuery(where!)
        .params.some((param) => String(param).includes(String('项目')))
    ).toBe(true)
  })
})
