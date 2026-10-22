import type { CrudRepositoryOptions } from './types'

// 多租户常量
const TENANT_COLUMN_NAME = 'tenantId'
const TENANT_IGNORE_TABLES = ['sys_tenant']

// 软删除常量
const SOFT_DELETE_COLUMN_NAME = 'deleted'
const SOFT_DELETE_DELETEDValue = true
const SOFT_DELETE_NOT_DELETEDValue = false

// 乐观锁常量
const OPTIMISTIC_LOCK_COLUMN_NAME = 'version'

// 审计填充常量
export const AUDIT_COLUMNS = {
  createdAt: 'createdAt',
  createdBy: 'createBy',
  createdByName: 'creatorName',

  updatedAt: 'updatedAt',
  updatedBy: 'updateBy',
  updatedByName: 'updaterName',

  deletedAt: 'deletedAt',
  deletedBy: 'deleteBy',
  deletedByName: 'deleterName',
} as const

// 默认options
export const DEFAULT_OPTIONS: Omit<CrudRepositoryOptions, 'table'> = {
  keyColumnName: 'id',

  tenant: {
    enabled: true,
    columnName: TENANT_COLUMN_NAME,
    ignoreTables: TENANT_IGNORE_TABLES,
  },

  softDelete: {
    enabled: true,
    columnName: SOFT_DELETE_COLUMN_NAME,
    deletedValue: SOFT_DELETE_DELETEDValue,
    notDeletedValue: SOFT_DELETE_NOT_DELETEDValue,
  },

  optimisticLock: {
    enabled: true,
    columnName: OPTIMISTIC_LOCK_COLUMN_NAME,
  },

  audit: {
    enabled: true,
    columns: AUDIT_COLUMNS,
  },
  ignoreWriteColumns: [],
}
