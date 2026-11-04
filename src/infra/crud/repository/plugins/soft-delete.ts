import { eq } from 'drizzle-orm'
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core'
import { mergeAnd } from '@/infra/db/utils'
import type { CrudPlugin } from '../plugin'
import type { DeleteContext, QueryContext } from '../types'

/**
 * 软删除插件配置
 */
export interface SoftDeletePluginOptions {
  /**
   * 软删除标记列名
   */
  columnName?: string
  /**
   * 已删除值
   */
  deletedValue?: unknown
  /**
   * 未删除值
   */
  notDeletedValue?: unknown
}

/**
 * 软删除插件
 *
 * 查询时自动过滤已删除记录，删除时标记而非物理删除
 */
export function softDeletePlugin<TTable extends PgTable>(
  options: SoftDeletePluginOptions = {}
): CrudPlugin<TTable> {
  const {
    columnName = 'deleted',
    deletedValue = true,
    notDeletedValue = false,
  } = options

  return {
    name: 'softDelete',
    priority: 15,

    beforeQuery(context: QueryContext<TTable>) {
      // 列表查询与统计都必须排除已删除记录
      const columns = context.table as Record<string, unknown>
      const column = columns[columnName]
      if (!column) return

      context.options.where = mergeAnd(
        context.options.where,
        eq(column as PgColumn, notDeletedValue)
      )
    },

    beforeDelete(context: DeleteContext<TTable>) {
      // 默认使用软删除，除非明确指定 softDelete: false
      if (context.softDelete === false) return

      const columns = context.table as Record<string, unknown>
      const column = columns[columnName]
      if (!column) return

      context.softDelete = true
      context.values = {
        ...context.values,
        [columnName]: deletedValue,
      }
    },
  }
}
