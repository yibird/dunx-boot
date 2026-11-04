import { describe, expect, test } from 'bun:test'
import { PgDialect } from 'drizzle-orm/pg-core'
import {
  endsWithIf,
  eqOrNull,
  gtIf,
  gteIf,
  isNotNullIf,
  isNullIf,
  likeIf,
  ltIf,
  lteIf,
  neIf,
  notIlikeIf,
  notInIf,
  notIf,
  searchIf,
  startsWithIf,
  when,
} from '@/infra/db'
import { sysDept } from '@/schemas'

const dialect = new PgDialect()

function render(
  condition: Parameters<typeof dialect.sqlToQuery>[0] | undefined
) {
  return condition ? dialect.sqlToQuery(condition) : undefined
}

describe('comparison helpers', () => {
  test('neIf / gtIf / gteIf / ltIf / lteIf', () => {
    expect(render(neIf(sysDept.parentId, '1'))?.sql).toBe(
      '"sys_dept"."parent_id" <> $1'
    )
    expect(render(gtIf(sysDept.sort, 1))?.sql).toBe('"sys_dept"."sort" > $1')
    expect(render(gteIf(sysDept.sort, 1))?.sql).toBe('"sys_dept"."sort" >= $1')
    expect(render(ltIf(sysDept.sort, 1))?.sql).toBe('"sys_dept"."sort" < $1')
    expect(render(lteIf(sysDept.sort, 1))?.sql).toBe('"sys_dept"."sort" <= $1')
  })

  test('值为 null / undefined 时不生成条件', () => {
    expect(render(neIf(sysDept.parentId, null))).toBeUndefined()
    expect(render(gtIf(sysDept.sort, undefined))).toBeUndefined()
  })

  test('eqOrNull 在空值时退化为 IS NULL', () => {
    expect(render(eqOrNull(sysDept.leaderId, null))?.sql).toBe(
      '("sys_dept"."leader_id" is null)'
    )
    expect(render(eqOrNull(sysDept.leaderId, '1'))?.params).toEqual(['1'])
  })
})

describe('null / not helpers', () => {
  test('isNullIf / isNotNullIf', () => {
    expect(render(isNullIf(sysDept.leaderId))?.sql).toBe(
      '("sys_dept"."leader_id" is null)'
    )
    expect(render(isNotNullIf(sysDept.leaderId))?.sql).toBe(
      '("sys_dept"."leader_id" is not null)'
    )
    expect(render(isNullIf(sysDept.leaderId, false))).toBeUndefined()
  })

  test('notIf 对条件取反', () => {
    expect(render(notIf(isNullIf(sysDept.leaderId)))?.sql).toBe(
      'not (("sys_dept"."leader_id" is null))'
    )
    expect(render(notIf(undefined))).toBeUndefined()
  })

  test('when 按条件构造', () => {
    expect(
      render(when(false, () => isNullIf(sysDept.leaderId)))
    ).toBeUndefined()
    expect(render(when(true, () => isNullIf(sysDept.leaderId)))).toBeDefined()
  })
})

describe('string helpers', () => {
  test('likeIf 区分大小写，notIlikeIf 取反', () => {
    expect(render(likeIf(sysDept.deptName, '研发'))?.sql).toBe(
      '"sys_dept"."dept_name" like $1'
    )
    expect(render(notIlikeIf(sysDept.deptName, '研发'))?.sql).toBe(
      'not ("sys_dept"."dept_name" ilike $1)'
    )
  })

  test('startsWithIf / endsWithIf 使用对应通配符', () => {
    expect(render(startsWithIf(sysDept.deptName, '研发'))?.params).toEqual([
      '研发%',
    ])
    expect(render(endsWithIf(sysDept.deptName, '研发'))?.params).toEqual([
      '%研发',
    ])
  })

  test('searchIf 在多列间用 OR 连接', () => {
    expect(
      render(searchIf([sysDept.deptName, sysDept.leaderName], '张'))?.sql
    ).toBe(
      '(("sys_dept"."dept_name" ilike $1) or ("sys_dept"."leader_name" ilike $2))'
    )
    expect(render(searchIf([sysDept.deptName], ''))).toBeUndefined()
  })
})

describe('array helpers', () => {
  test('notInIf', () => {
    expect(render(notInIf(sysDept.id, ['1', '2']))?.sql).toBe(
      '"sys_dept"."id" not in ($1, $2)'
    )
    expect(render(notInIf(sysDept.id, []))).toBeUndefined()
  })
})
