import { eq, getTableName } from 'drizzle-orm'
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core'
import { getTenantId } from '@/infra/context'
import { mergeAnd } from '@/infra/db/utils'
import type { CrudPlugin } from '../plugin'
import type {
  CreateContext,
  DeleteContext,
  QueryContext,
  UpdateContext,
} from '../types'

/**
 * 多租户插件配置
 */
export interface TenantPluginOptions {
  /**
   * 租户列名
   */
  columnName?: string
  /**
   * 忽略的表名列表
   */
  ignoreTables?: string[]
}

/**
 * 多租户隔离插件
 *
 * 自动在查询/写入时添加租户条件
 */
export function tenantPlugin<TTable extends PgTable>(
  options: TenantPluginOptions = {}
): CrudPlugin<TTable> {
  const { columnName = 'tenantId', ignoreTables = ['sys_tenant'] } = options

  const isTableIgnored = (table: PgTable) => {
    return !ignoreTables.includes(getTableName(table))
  }

  return {
    name: 'tenant',
    priority: 10,
    beforeQuery(context: QueryContext<TTable>) {
      if (!isTableIgnored(context.table)) return
      const tenantId = getTenantId()
      if (!tenantId) return
      const columns = context.table as Record<string, unknown>
      const column = columns[columnName]
      if (!column) return
      context.options.where = mergeAnd(
        context.options.where,
        eq(column as PgColumn, tenantId)
      )
    },
    beforeCreate(context: CreateContext<TTable>) {
      if (!isTableIgnored(context.table)) return
      const tenantId = getTenantId()
      if (!tenantId) return
      if (Array.isArray(context.values)) {
        for (const value of context.values as Record<string, unknown>[]) {
          value[columnName] = tenantId
        }
      } else {
        ;(context.values as Record<string, unknown>)[columnName] = tenantId
      }
    },

    beforeUpdate(context: UpdateContext<TTable>) {
      if (!isTableIgnored(context.table)) return

      const tenantId = getTenantId()
      if (!tenantId) return

      const columns = context.table as Record<string, unknown>
      const column = columns[columnName]
      if (!column) return

      context.where = mergeAnd(context.where, eq(column as PgColumn, tenantId))
    },

    beforeDelete(context: DeleteContext<TTable>) {
      if (!isTableIgnored(context.table)) return
      const tenantId = getTenantId()
      if (!tenantId) return
      const columns = context.table as Record<string, unknown>
      const column = columns[columnName]
      if (!column) return
      context.where = mergeAnd(context.where, eq(column as PgColumn, tenantId))
    },
  }
}
