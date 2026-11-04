import { buildAiSkillQueryOptions as getQueryOptions } from '@/features/ai/skill/controller'
import { describe, expect, test } from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'

const dialect = new PgDialect()

describe('AiSkillService.getQueryOptions', () => {
  test('没有查询条件时不生成 where', () => {
    expect(getQueryOptions({}).where).toBeUndefined()
  })

  test('映射 name 查询条件', () => {
    const where = getQueryOptions({ name: '翻译' }).where
    expect(where).toBeDefined()
    expect(
      dialect
        .sqlToQuery(where!)
        .params.some((param) => String(param).includes(String('翻译')))
    ).toBe(true)
  })
})
