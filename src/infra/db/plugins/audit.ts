import { sessionContext } from '../../context'
import { DateUtils } from '@/utils'

/**
 * 审计字段映射
 *
 * 每个字段都是表上的列名；未配置的字段不会写入。
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
 * 审计操作类型
 */
export type AuditOperation = 'create' | 'update' | 'delete'

/**
 * 审计操作人
 */
export interface AuditActor {
  userId?: string | undefined
  account?: string | undefined
}

/**
 * 审计填充选项
 */
export interface AuditOptions {
  /**
   * 审计字段映射
   */
  columns?: AuditColumns
  /**
   * 操作人；缺省取当前会话
   */
  actor?: AuditActor
  /**
   * 操作时间；缺省取当前时间
   */
  now?: Date | number | string
}

const DEFAULT_AUDIT_COLUMNS: Required<AuditColumns> = {
  createdAt: 'createdAt',
  createdBy: 'createBy',
  createdByName: 'creatorName',
  updatedAt: 'updatedAt',
  updatedBy: 'updateBy',
  updatedByName: 'updaterName',
  deletedAt: 'deletedAt',
  deletedBy: 'deleteBy',
  deletedByName: 'deleterName',
}

const AUDIT_FIELDS = {
  create: {
    at: 'createdAt',
    by: 'createdBy',
    byName: 'createdByName',
  },
  update: {
    at: 'updatedAt',
    by: 'updatedBy',
    byName: 'updatedByName',
  },
  delete: {
    at: 'deletedAt',
    by: 'deletedBy',
    byName: 'deletedByName',
  },
} as const satisfies Record<
  AuditOperation,
  { at: keyof AuditColumns; by: keyof AuditColumns; byName: keyof AuditColumns }
>

/**
 * 生成审计字段值
 *
 * 只包含配置了列名的字段；没有操作人时只写入时间。
 *
 * @param operation 审计操作类型
 * @param options 审计选项
 * @returns 审计字段键值对
 */
export function withAuditValues(
  operation: AuditOperation,
  options: AuditOptions = {}
): Record<string, string | undefined> {
  const columns = { ...DEFAULT_AUDIT_COLUMNS, ...options.columns }
  const fields = AUDIT_FIELDS[operation]
  const actor = options.actor ?? sessionContext.get()
  const at = DateUtils.format(options.now ?? new Date())
  const values: Record<string, string | undefined> = {
    [columns[fields.at]]: at,
  }

  if (actor?.userId) {
    values[columns[fields.by]] = actor.userId
    values[columns[fields.byName]] = actor.account
  }

  return values
}

/**
 * 把审计字段写入给定对象
 *
 * @param values 待写入数据
 * @param operation 审计操作类型
 * @param options 审计选项
 * @returns 原对象（原地修改）
 */
export function withAudit<T extends Record<string, unknown>>(
  values: T,
  operation: AuditOperation,
  options?: AuditOptions
): T {
  return Object.assign(values, withAuditValues(operation, options))
}
