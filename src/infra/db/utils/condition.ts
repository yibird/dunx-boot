import {
  and,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  type AnyColumn,
  type SQL,
} from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'

export function filterSql(sqls: (SQL | undefined)[]) {
  return sqls.filter((sql): sql is SQL => sql !== undefined)
}

/**
 * 合并sql,使用and连接
 *
 * @param sqls  sql集合
 * @returns 返回合并后的sql
 */
export function mergeAnd(...sqls: (SQL | undefined)[]) {
  const sql = filterSql(sqls)
  if (sql.length === 0) return undefined
  if (sql.length === 1) return sql[0]
  return and(...sql)
}

/**
 * 合并sql,使用or连接
 * @param sqls  sql集合
 * @returns 返回合并后的sql
 */
export function mergeOr(...sqls: (SQL | undefined)[]) {
  const sql = filterSql(sqls)
  if (sql.length === 0) return undefined
  if (sql.length === 1) return sql[0]
  return or(...sql)
}

/**
 * 构造等值查询条件。
 *
 * @param column 查询列
 * @param value 查询值，为 null 或 undefined 时不生成条件
 * @returns 等值查询条件
 */
export function eqIf<T>(column: AnyColumn, value: T | null | undefined) {
  return value != null ? eq(column, value) : undefined
}

/**
 * 构造模糊匹配查询条件。
 *
 * @param column 查询列
 * @param value 查询值，为空字符串、null 或 undefined 时不生成条件
 * @returns 模糊匹配查询条件
 */
export function ilikeIf(column: AnyColumn, value: string | null | undefined) {
  return value ? ilike(column, `%${value}%`) : undefined
}

/**
 * 构造 IN 查询条件。
 *
 * @param column 查询列
 * @param values 候选值集合，为空数组、null 或 undefined 时不生成条件
 * @returns IN 查询条件
 */
export function inIf<T>(
  column: AnyColumn,
  values: readonly T[] | null | undefined
) {
  return values?.length ? inArray(column, values as T[]) : undefined
}

export type Range<T> = readonly [Nullable<T>, Nullable<T>] | null | undefined

/**
 * 构造范围查询条件。
 *
 * 支持仅指定起始值、仅指定结束值或同时指定两端。
 * 两端均未指定时不生成条件。
 *
 * @param column 查询列
 * @param range 查询范围，[最小值, 最大值]
 * @returns 范围查询条件
 */
export function betweenIf<T>(column: PgColumn, range: Range<T>) {
  if (!range || (range[0] == null && range[1] == null)) return undefined
  return and(
    range[0] != null ? gte(column, range[0]) : undefined,
    range[1] != null ? lte(column, range[1]) : undefined
  )
}
