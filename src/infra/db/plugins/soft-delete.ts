import { eq } from 'drizzle-orm'
import type { AnyColumn, SQL } from 'drizzle-orm'

/**
 * 软删除选项
 */
export interface SoftDeleteOptions {
  /**
   * 软删除标记列名
   */
  columnName?: string
  /**
   * 已删除值，默认 true
   */
  deletedValue?: unknown
  /**
   * 未删除值，默认 false
   */
  notDeletedValue?: unknown
}

const DEFAULT_OPTIONS = {
  columnName: 'deleted',
  deletedValue: true,
  notDeletedValue: false,
} as const

/**
 * 生成“未删除”查询条件
 *
 * @param column 软删除标记列
 * @param options 软删除选项
 * @returns `column = notDeletedValue` 条件
 */
export function withNotDeleted(
  column: AnyColumn,
  options: SoftDeleteOptions = {}
): SQL {
  const { notDeletedValue = DEFAULT_OPTIONS.notDeletedValue } = options
  return eq(column, notDeletedValue)
}

/**
 * 生成“已删除”查询条件
 *
 * @param column 软删除标记列
 * @param options 软删除选项
 * @returns `column = deletedValue` 条件
 */
export function withDeleted(
  column: AnyColumn,
  options: SoftDeleteOptions = {}
): SQL {
  const { deletedValue = DEFAULT_OPTIONS.deletedValue } = options
  return eq(column, deletedValue)
}

/**
 * 生成软删除的写入数据
 *
 * @param options 软删除选项
 * @returns 形如 `{ deleted: true }` 的写入值
 */
export function withSoftDeleteValue(
  options: SoftDeleteOptions = {}
): Record<string, unknown> {
  const {
    columnName = DEFAULT_OPTIONS.columnName,
    deletedValue = DEFAULT_OPTIONS.deletedValue,
  } = options
  return { [columnName]: deletedValue }
}
