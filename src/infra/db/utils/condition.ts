import { isEmpty } from '@/utils'
import {
  and,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  not,
  notInArray,
  or,
  type AnyColumn,
  type SQL,
} from 'drizzle-orm'
import type { AnyPgColumn, PgColumn } from 'drizzle-orm/pg-core'

/**
 * 排序/分组项集合
 */
export type ColumnList = readonly (SQL | AnyPgColumn)[]

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
 * 合并排序条件
 *
 * 按传入顺序拼接，忽略 null/undefined，返回新数组。
 *
 * @param orderBys 排序集合
 * @returns 合并后的排序集合
 */
export function mergeOrderBy(
  ...orderBys: (ColumnList | null | undefined)[]
): (SQL | AnyPgColumn)[] {
  return orderBys.flatMap((orderBy) => orderBy ?? [])
}

/**
 * 合并分组条件
 *
 * 按传入顺序拼接，忽略 null/undefined，返回新数组。
 *
 * @param groupBys 分组集合
 * @returns 合并后的分组集合
 */
export function mergeGroupBy(
  ...groupBys: (ColumnList | null | undefined)[]
): (SQL | AnyPgColumn)[] {
  return groupBys.flatMap((groupBy) => groupBy ?? [])
}

/**
 * 构造等值查询条件。
 *
 * @param column 查询列
 * @param value 查询值，为 null 或 undefined 时不生成条件
 * @returns 等值查询条件
 */
export function eqIf<T>(column: AnyColumn, value: T | null | undefined) {
  return !isEmpty(value) ? eq(column, value) : undefined
}

/**
 * 构造不等查询条件。
 *
 * @param column 查询列
 * @param value 查询值，为 null 或 undefined 时不生成条件
 * @returns 不等查询条件
 */
export function neIf<T>(column: AnyColumn, value: T | null | undefined) {
  return !isEmpty(value) ? ne(column, value) : undefined
}

/**
 * 构造大于查询条件。
 *
 * @param column 查询列
 * @param value 比较值，为 null 或 undefined 时不生成条件
 * @returns 大于查询条件
 */
export function gtIf<T>(column: AnyColumn, value: T | null | undefined) {
  return !isEmpty(value) ? gt(column, value) : undefined
}

/**
 * 构造大于等于查询条件。
 *
 * @param column 查询列
 * @param value 比较值，为 null 或 undefined 时不生成条件
 * @returns 大于等于查询条件
 */
export function gteIf<T>(column: AnyColumn, value: T | null | undefined) {
  return !isEmpty(value) ? gte(column, value) : undefined
}

/**
 * 构造小于查询条件。
 *
 * @param column 查询列
 * @param value 比较值，为 null 或 undefined 时不生成条件
 * @returns 小于查询条件
 */
export function ltIf<T>(column: AnyColumn, value: T | null | undefined) {
  return !isEmpty(value) ? lt(column, value) : undefined
}

/**
 * 构造小于等于查询条件。
 *
 * @param column 查询列
 * @param value 比较值，为 null 或 undefined 时不生成条件
 * @returns 小于等于查询条件
 */
export function lteIf<T>(column: AnyColumn, value: T | null | undefined) {
  return !isEmpty(value) ? lte(column, value) : undefined
}

/**
 * 构造 IS NULL 条件。
 *
 * @param column 查询列
 * @param enabled 是否启用该条件，默认 true
 * @returns IS NULL 条件
 */
export function isNullIf(column: AnyColumn, enabled = true) {
  return enabled ? isNull(column) : undefined
}

/**
 * 构造 IS NOT NULL 条件。
 *
 * @param column 查询列
 * @param enabled 是否启用该条件，默认 true
 * @returns IS NOT NULL 条件
 */
export function isNotNullIf(column: AnyColumn, enabled = true) {
  return enabled ? isNotNull(column) : undefined
}

/**
 * 构造 NOT 条件。
 *
 * @param condition 原始条件，为 undefined 时不生成条件
 * @returns 取反后的条件
 */
export function notIf(condition: SQL | undefined) {
  return condition ? not(condition) : undefined
}

/**
 * 条件满足时才构造 SQL。
 *
 * @param condition 是否满足
 * @param factory 条件构造器
 * @returns 满足时返回构造结果，否则返回 undefined
 */
export function when(
  condition: boolean,
  factory: () => SQL | undefined
): SQL | undefined {
  return condition ? factory() : undefined
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
 * 构造区分大小写的模糊匹配条件。
 *
 * @param column 查询列
 * @param value 查询值，为空字符串、null 或 undefined 时不生成条件
 * @returns 模糊匹配查询条件
 */
export function likeIf(column: AnyColumn, value: string | null | undefined) {
  return value ? like(column, `%${value}%`) : undefined
}

/**
 * 构造不区分大小写的反向模糊匹配条件。
 *
 * @param column 查询列
 * @param value 查询值，为空字符串、null 或 undefined 时不生成条件
 * @returns 反向模糊匹配条件
 */
export function notIlikeIf(
  column: AnyColumn,
  value: string | null | undefined
) {
  return value ? not(ilike(column, `%${value}%`)) : undefined
}

/**
 * 构造前缀匹配条件。
 *
 * @param column 查询列
 * @param value 查询值，为空字符串、null 或 undefined 时不生成条件
 * @returns 前缀匹配条件
 */
export function startsWithIf(
  column: AnyColumn,
  value: string | null | undefined
) {
  return value ? ilike(column, `${value}%`) : undefined
}

/**
 * 构造后缀匹配条件。
 *
 * @param column 查询列
 * @param value 查询值，为空字符串、null 或 undefined 时不生成条件
 * @returns 后缀匹配条件
 */
export function endsWithIf(
  column: AnyColumn,
  value: string | null | undefined
) {
  return value ? ilike(column, `%${value}`) : undefined
}

/**
 * 在多列上做模糊搜索，列之间用 OR 连接。
 *
 * @param columns 参与搜索的列
 * @param value 查询值，为空字符串、null 或 undefined 时不生成条件
 * @returns 多列搜索条件
 */
export function searchIf(
  columns: readonly AnyColumn[],
  value: string | null | undefined
) {
  if (!value || columns.length === 0) return undefined
  return mergeOr(...columns.map((column) => ilike(column, `%${value}%`)))
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

/**
 * 构造 NOT IN 查询条件。
 *
 * @param column 查询列
 * @param values 候选值集合，为空数组、null 或 undefined 时不生成条件
 * @returns NOT IN 查询条件
 */
export function notInIf<T>(
  column: AnyColumn,
  values: readonly T[] | null | undefined
) {
  return values?.length ? notInArray(column, values as T[]) : undefined
}

/**
 * 构造可空列的等值条件。
 *
 * 值存在时生成 `column = value`，为空时生成 `column IS NULL`。
 *
 * @param column 查询列
 * @param value 查询值
 * @returns 等值或 IS NULL 条件
 */
export function eqOrNull<T>(column: AnyColumn, value: T | null | undefined) {
  return value == null ? isNull(column) : eq(column, value)
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
