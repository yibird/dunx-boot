import { sessionContext } from '@/infra/context'
import { DateUtils } from '@/utils'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { CrudPlugin } from '../plugin'
import type { CreateContext, DeleteContext, UpdateContext } from '../types'

/**
 * 审计字段映射
 */
export interface AuditColumns {
  createdAt?: string
  createdBy?: string
  createdByName?: string
  updatedAt?: string
  updatedBy?: string
  updatedByName?: string
  deletedAt?: string
  deletedBy?: string
  deletedByName?: string
}

/**
 * 审计插件配置
 */
export interface AuditPluginOptions {
  /**
   * 审计字段映射
   */
  columns?: AuditColumns
}
type AuditOperation = 'create' | 'update' | 'delete'

/**
 * 审计字段填充插件
 *
 * 自动填充创建、更新、删除相关的审计字段
 */
export function auditPlugin<TTable extends PgTable>(
  options: AuditPluginOptions = {}
): CrudPlugin<TTable> {
  const columns: Required<AuditColumns> = {
    createdAt: 'createdAt',
    createdBy: 'createBy',
    createdByName: 'creatorName',
    updatedAt: 'updatedAt',
    updatedBy: 'updateBy',
    updatedByName: 'updaterName',
    deletedAt: 'deletedAt',
    deletedBy: 'deleteBy',
    deletedByName: 'deleterName',
    ...options.columns,
  }

  const auditColumns = {
    create: {
      datetime: columns.createdAt,
      userId: columns.createdBy,
      userName: columns.createdByName,
    },
    update: {
      datetime: columns.updatedAt,
      userId: columns.updatedBy,
      userName: columns.updatedByName,
    },
    delete: {
      datetime: columns.deletedAt,
      userId: columns.deletedBy,
      userName: columns.deletedByName,
    },
  } satisfies Record<
    AuditOperation,
    { datetime: string; userId: string; userName: string }
  >

  const fillAudit = (
    values: Record<string, unknown>,
    operation: AuditOperation
  ) => {
    const { datetime, userId, userName } = auditColumns[operation]
    const session = sessionContext.get()

    values[datetime] = DateUtils.format(new Date())

    if (session?.userId) {
      values[userId] = session.userId
      values[userName] = session.account
    }
  }

  return {
    name: 'audit',
    priority: 20,

    beforeCreate(context: CreateContext<TTable>) {
      if (Array.isArray(context.values)) {
        for (const value of context.values) {
          fillAudit(value, 'create')
        }
      } else {
        fillAudit(context.values, 'create')
      }
    },

    beforeUpdate(context: UpdateContext<TTable>) {
      fillAudit(context.values, 'update')
    },

    beforeDelete(context: DeleteContext<TTable>) {
      if (context.softDelete && context.values) {
        fillAudit(context.values, 'delete')
      }
    },
  }
}
