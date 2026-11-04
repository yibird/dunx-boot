import { eq, sql } from 'drizzle-orm'
import type { AnyColumn } from 'drizzle-orm'

/**
 * 生成版本匹配条件
 *
 * @param column 版本列
 * @param expected 调用方持有的版本号
 * @returns `column = expected` 条件
 */
export function withVersion(column: AnyColumn, expected: number) {
  return eq(column, expected)
}

/**
 * 生成版本递增表达式
 *
 * 在数据库端执行 `version + 1`，避免应用层读改写。
 *
 * @param column 版本列
 * @returns `column + 1` SQL 表达式
 */
export function withVersionIncrement(column: AnyColumn) {
  return sql`${column} + 1`
}
