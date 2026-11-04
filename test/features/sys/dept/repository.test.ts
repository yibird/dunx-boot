import { buildSysDeptQueryOptions as getQueryOptions } from '@/features/sys/dept/controller'
import { describe, expect, test } from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'
import {
  SysDeptCreateReqSchema,
  SysDeptQuerySchema,
} from '@/features/sys/dept/schema'

const dialect = new PgDialect()

/**
 * `getQueryOptions` 只依赖导入的列定义，不读取实例状态，直接借原型调用即可，
 * 无需为仓储注入数据库。
 */

function render(where?: SQL) {
  return where ? dialect.sqlToQuery(where) : undefined
}

describe('SysDeptRepository.getQueryOptions', () => {
  test('没有查询条件时不生成 where', () => {
    expect(render(getQueryOptions({}).where)).toBeUndefined()
  })

  test('部门名称走模糊匹配', () => {
    const query = render(getQueryOptions({ deptName: '研发' }).where)

    expect(query?.sql).toBe('"sys_dept"."dept_name" ilike $1')
    expect(query?.params).toEqual(['%研发%'])
  })

  test('空字符串不生成模糊条件', () => {
    expect(render(getQueryOptions({ deptName: '' }).where)).toBeUndefined()
  })

  test('父部门 id 走等值匹配', () => {
    const query = render(getQueryOptions({ parentId: '3' }).where)

    expect(query?.sql).toBe('"sys_dept"."parent_id" = $1')
    expect(query?.params).toEqual(['3'])
  })

  test('多个条件用 and 合并', () => {
    const query = render(
      getQueryOptions({ deptName: '研发', parentId: '3' }).where
    )

    expect(query?.sql).toBe(
      '(("sys_dept"."dept_name" ilike $1) and ("sys_dept"."parent_id" = $2))'
    )
    expect(query?.params).toEqual(['%研发%', '3'])
  })
})

describe('SysDept schema', () => {
  test('新增要求部门名称与根部门字段', () => {
    const input = {
      deptName: '研发部',
      rootId: '0',
      parentId: '0',
      leaderId: null,
      leaderName: null,
      sort: 0,
      remark: null,
    }

    expect(SysDeptCreateReqSchema.safeParse(input).success).toBe(true)
    expect(
      SysDeptCreateReqSchema.safeParse({ ...input, deptName: undefined })
        .success
    ).toBe(false)
  })

  test('查询参数会补齐默认分页', () => {
    expect(SysDeptQuerySchema.parse({})).toEqual({ current: 1, pageSize: 10 })
  })
})
