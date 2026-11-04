import { eq, sql } from 'drizzle-orm'
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core'
import { ConflictError } from '@/errors'
import { mergeAnd } from '@/infra/db/utils'
import type { CrudPlugin } from '../plugin'
import type { CreateContext, UpdateContext } from '../types'

/**
 * 乐观锁插件配置
 */
export interface OptimisticLockPluginOptions {
  /**
   * 版本列名
   */
  columnName?: string
}

/**
 * 乐观锁插件
 *
 * 创建时初始化版本号，更新时校验并递增版本号
 */
export function optimisticLockPlugin<TTable extends PgTable>(
  options: OptimisticLockPluginOptions = {}
): CrudPlugin<TTable> {
  const { columnName = 'version' } = options

  return {
    name: 'optimisticLock',
    priority: 30,

    beforeCreate(context: CreateContext<TTable>) {
      if (Array.isArray(context.values)) {
        for (const value of context.values as Record<string, unknown>[]) {
          value[columnName] = 1
        }
      } else {
        ;(context.values as Record<string, unknown>)[columnName] = 1
      }
    },

    beforeDelete(context) {
      // 软删除同样是一次更新，版本号必须递增
      if (!context.softDelete) return

      const columns = context.table as Record<string, unknown>
      const column = columns[columnName]
      if (!column) return

      ;(context.values as Record<string, unknown>)[columnName] =
        sql`${column as PgColumn} + 1`
    },

    beforeUpdate(context: UpdateContext<TTable>) {
      const columns = context.table as Record<string, unknown>
      const column = columns[columnName]
      if (!column) return

      // 从输入读取预期版本号
      const expectedVersion = (context.input as Record<string, unknown>)[
        columnName
      ]
      if (expectedVersion === undefined) {
        throw new ConflictError('更新数据缺少版本号')
      }

      // 添加版本匹配条件
      context.where = mergeAnd(
        context.where,
        eq(column as PgColumn, expectedVersion)
      )

      // 设置版本递增表达式
      ;(context.values as Record<string, unknown>)[columnName] =
        sql`${column as PgColumn} + 1`

      // 保存预期版本，供 after 钩子使用
      context.metadata.set('optimisticLock:expectedVersion', expectedVersion)
    },

    async afterUpdate(context) {
      // 如果更新失败（返回空），检查是否版本冲突
      if (!context.result) {
        const expectedVersion = context.metadata.get(
          'optimisticLock:expectedVersion'
        )
        if (expectedVersion !== undefined) {
          throw new ConflictError('数据已被修改，请刷新后重试')
        }
      }
    },
  }
}
