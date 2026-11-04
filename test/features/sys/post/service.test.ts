import { buildSysPostQueryOptions as getQueryOptions } from '@/features/sys/post/controller'
import { describe, expect, test } from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'
import {
  sysPostCreateReqSchema,
  sysPostQuerySchema,
  sysPostUpdateReqSchema,
} from '@/features/sys/post/schema'

const dialect = new PgDialect()

function render(where?: SQL) {
  return where ? dialect.sqlToQuery(where) : undefined
}

describe('SysPostService.getQueryOptions', () => {
  test('没有查询条件时不生成 where', () => {
    expect(render(getQueryOptions({}).where)).toBeUndefined()
  })

  test('岗位名称模糊匹配、岗位等级等值匹配', () => {
    const query = render(
      getQueryOptions({ postName: '工程师', postLevel: 3 }).where
    )

    expect(query?.sql).toBe(
      '(("sys_post"."post_name" ilike $1) and ("sys_post"."post_level" = $2))'
    )
    expect(query?.params).toEqual(['%工程师%', 3])
  })

  test('岗位等级 0 不会被当成空值丢弃', () => {
    expect(render(getQueryOptions({ postLevel: 0 }).where)?.params).toEqual([0])
  })
})

describe('SysPost schema', () => {
  test('查询参数会把字符串等级转成数字', () => {
    expect(sysPostQuerySchema.parse({ postLevel: '4' })).toEqual({
      current: 1,
      pageSize: 10,
      postLevel: 4,
    })
  })

  test('新增要求岗位名称与等级', () => {
    expect(
      sysPostCreateReqSchema.safeParse({
        postName: '工程师',
        postLevel: 3,
        remark: null,
      }).success
    ).toBe(true)
    expect(
      sysPostCreateReqSchema.safeParse({ postName: '工程师' }).success
    ).toBe(false)
  })

  test('更新必须携带主键', () => {
    const base = { postName: '工程师', postLevel: 3, remark: null }

    expect(sysPostUpdateReqSchema.safeParse({ ...base, id: '1' }).success).toBe(
      true
    )
    expect(sysPostUpdateReqSchema.safeParse(base).success).toBe(false)
  })
})
