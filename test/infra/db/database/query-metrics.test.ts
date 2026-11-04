import { describe, expect, test } from 'bun:test'
import {
  QueryMetrics,
  QUERY_OPERATIONS,
} from '@/infra/db/database/query-metrics'

describe('QueryMetrics', () => {
  test('按顶层关键字归类操作', () => {
    const metrics = new QueryMetrics()
    metrics.observe('select * from sys_user', 1_000_000)
    metrics.observe('insert into sys_user default values', 1_000_000)
    metrics.observe('update sys_user set name = $1', 1_000_000)
    metrics.observe('delete from sys_user', 1_000_000)
    metrics.observe('begin', 1_000_000)

    const snapshot = metrics.snapshot()

    expect(snapshot.total).toBe(5)
    expect(snapshot.operations.map((item) => item.operation)).toEqual([
      ...QUERY_OPERATIONS,
    ])
  })

  test('CTE 按最外层的操作归类', () => {
    const metrics = new QueryMetrics()
    metrics.observe(
      'with recent as (select * from sys_user) select * from recent',
      1_000_000
    )

    const [operation] = metrics.snapshot().operations
    expect(operation?.operation).toBe('select')
  })

  test('注释和字符串中的关键字不参与分类', () => {
    const metrics = new QueryMetrics()
    metrics.observe(
      "/* update sys_user */ select 'delete from x' from sys_user",
      1_000_000
    )

    const [operation] = metrics.snapshot().operations
    expect(operation?.operation).toBe('select')
  })

  test('统计次数、错误数与分位数', () => {
    const metrics = new QueryMetrics()
    for (const duration of [1e6, 2e6, 3e6, 4e6]) {
      metrics.observe('select 1', duration)
    }
    metrics.observe('select 1', 5e6, true)

    const [select] = metrics.snapshot().operations

    expect(select).toMatchObject({
      operation: 'select',
      count: 5,
      errors: 1,
    })
    expect(select?.duration).toMatchObject({
      count: 5,
      min: 1e6,
      max: 5e6,
      p50: 3e6,
    })
  })

  test('慢语句快照会脱敏参数与字面量', () => {
    const metrics = new QueryMetrics()
    metrics.observe(
      "select * from sys_user where id = $1 and name = 'bob' and age > 18",
      5e6
    )

    const [select] = metrics.snapshot().operations
    expect(select?.slowest).toBe(
      'select * from sys_user where id = ? and name = ? and age > ?'
    )
  })

  test('慢语句快照超长时截断', () => {
    const metrics = new QueryMetrics()
    metrics.observe(`select ${'a'.repeat(600)}`, 5e6)

    const [select] = metrics.snapshot().operations
    expect(select?.slowest).toHaveLength(501)
    expect(select?.slowest?.endsWith('…')).toBe(true)
  })
})
