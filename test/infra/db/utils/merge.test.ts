import { describe, expect, test } from 'bun:test'
import { getTableColumns } from 'drizzle-orm'
import { mergeGroupBy, mergeOrderBy } from '@/infra/db'
import { sysDept } from '@/schemas'

const { deptName, sort } = getTableColumns(sysDept)

describe('mergeOrderBy', () => {
  test('按顺序拼接并忽略空值', () => {
    expect(mergeOrderBy([sort], undefined, null, [deptName])).toEqual([
      sort,
      deptName,
    ])
  })

  test('全部为空时返回空数组', () => {
    expect(mergeOrderBy()).toEqual([])
    expect(mergeOrderBy(undefined, null)).toEqual([])
  })
})

describe('mergeGroupBy', () => {
  test('按顺序拼接并忽略空值', () => {
    expect(mergeGroupBy([deptName], undefined, [sort])).toEqual([
      deptName,
      sort,
    ])
  })

  test('返回新数组，不修改入参', () => {
    const defaults = [deptName]
    const merged = mergeGroupBy(defaults, [sort])

    expect(merged).not.toBe(defaults)
    expect(defaults).toEqual([deptName])
  })
})
