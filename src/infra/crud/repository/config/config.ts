import { getTableColumns, getTableName } from 'drizzle-orm'
import { omit } from 'es-toolkit'
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core'
import type {
  CrudAuditField,
  CrudRepositoryOptions,
  CrudSelect,
} from '../types'
import type {
  CrudAuditConfig,
  CrudConfig,
  CrudOptimisticLockConfig,
  CrudTenantConfig,
  PgColumns,
  SoftDeleteConfig,
} from './types'

/**
 * 获取配置
 *
 * @param options 选项配置
 * @returns 配置
 */
export function getConfig<
  TTable extends PgTable,
  TIgnore extends keyof CrudSelect<TTable> = never,
>(
  options: CrudRepositoryOptions<TTable, TIgnore>
): CrudConfig<TTable, TIgnore> {
  const tableName = getTableName(options.table)
  const columns = getTableColumns(options.table) as PgColumns
  const selectColumns = getSelectColumns(options, columns)
  const key = getKeyConfig(options, columns, tableName)
  const tenant = getTenantConfig(options, columns, tableName)
  const audit = getAuditConfig(options, columns, tableName)
  const softDelete = softDeleteConfig(options, columns, tableName)
  const optimisticLock = getOptimisticLockConfig(options, columns, tableName)

  const config: CrudConfig<TTable, TIgnore> = {
    selectColumns,
    key,
    tenant,
    audit,
    softDelete,
    optimisticLock,
    options,
    tableName,
  }
  return config
}

/**
 * 获取查询列
 *
 * @param options 选项配置
 * @param columns 列对象
 * @returns 查询列
 */
export function getSelectColumns<
  TTable extends PgTable,
  TIgnore extends keyof CrudSelect<TTable> = never,
>(options: CrudRepositoryOptions<TTable, TIgnore>, columns: PgColumns) {
  return omit(columns, options.ignoreColumns ?? [])
}

/**
 * 获取主键配置
 *
 * @param options 选项配置
 * @param columns 列对象
 * @returns 主键配置
 */
export function getKeyConfig<
  TTable extends PgTable,
  TIgnore extends keyof CrudSelect<TTable> = never,
>(
  options: CrudRepositoryOptions<TTable, TIgnore>,
  columns: PgColumns,
  tableName: string
) {
  const columnName = options.keyColumnName
  if (!columnName) {
    throw new Error(`[${tableName}]: 缺少主键配置`)
  }
  const column = columns[columnName]
  if (!column) {
    throw new Error(`[${tableName}]: 不存在主键字段`)
  }

  return {
    columnName,
    column,
  }
}

/**
 * 获取租户配置
 *
 * @param options 选项配置
 * @param columns 列对象
 * @returns 租户配置
 */
export function getTenantConfig<
  TTable extends PgTable,
  TIgnore extends keyof CrudSelect<TTable> = never,
>(
  options: CrudRepositoryOptions<TTable, TIgnore>,
  columns: PgColumns,
  tableName: string
): CrudTenantConfig | null | undefined {
  const { enabled, columnName, ignoreTables } = options.tenant || {}
  if (!enabled) return
  // 忽略清单里的表不做租户隔离（例如租户表自身）
  if (ignoreTables?.includes(tableName)) return

  if (!columnName) {
    throw new Error(`[${tableName}]: 缺少租户配置`)
  }

  if (columnName && !columns[columnName]) {
    throw new Error(`[${tableName}]: 不存在租户字段`)
  }
  return {
    ...options.tenant,
    column: columnName ? columns[columnName] : null,
  }
}

/**
 * 获取审计填充配置
 *
 * @param options 选项配置
 * @param columns 列对象
 * @returns 审计填充配置
 */
export function getAuditConfig<
  TTable extends PgTable,
  TIgnore extends keyof CrudSelect<TTable> = never,
>(
  options: CrudRepositoryOptions<TTable, TIgnore>,
  columns: PgColumns,
  tableName: string
): CrudAuditConfig | null | undefined {
  const { enabled, columns: auditColumns } = options.audit || {}
  if (!enabled) return

  const cols: Record<CrudAuditField, PgColumn | null | undefined> = {
    createdAt: null,
    createdBy: null,
    createdByName: null,
    updatedAt: null,
    updatedBy: null,
    updatedByName: null,
    deletedAt: null,
    deletedBy: null,
    deletedByName: null,
  }

  if (enabled && auditColumns) {
    for (const [field, columnName] of Object.entries(auditColumns)) {
      // 查表列要用配置的**列名**，不是审计字段名（两者不同：createdBy → createBy）
      const column = columns[columnName]
      if (!column) {
        throw new Error(`[${tableName}]: 不存在审计字段 ${columnName}`)
      }
      Reflect.set(cols, field, column)
    }
    return {
      ...options.audit,
      auditColumns: cols,
    }
  }
}

/**
 * 获取乐观锁配置
 *
 * `enabled: false` 时返回 `undefined`（不做版本自增，也不做版本校验）；
 * 启用时列必须存在，否则构造报错。
 *
 * @param options 选项配置
 * @param columns 列对象
 * @param tableName 表名
 * @returns 乐观锁配置
 */
export function getOptimisticLockConfig<
  TTable extends PgTable,
  TIgnore extends keyof CrudSelect<TTable> = never,
>(
  options: CrudRepositoryOptions<TTable, TIgnore>,
  columns: PgColumns,
  tableName: string
): CrudOptimisticLockConfig | null | undefined {
  const { enabled, columnName } = options.optimisticLock || {}
  if (!enabled) return
  if (!columnName) {
    throw new Error(`[${tableName}]: 缺少乐观锁配置`)
  }
  if (!columns[columnName]) {
    throw new Error(`[${tableName}]: 不存在乐观锁字段 ${columnName}`)
  }
  return {
    ...options.optimisticLock,
    column: columns[columnName],
  }
}

/**
 * 获取软删除配置
 *
 * @param options 选项配置
 * @param columns 列对象
 * @returns 软删除配置
 */
export function softDeleteConfig<
  TTable extends PgTable,
  TIgnore extends keyof CrudSelect<TTable> = never,
>(
  options: CrudRepositoryOptions<TTable, TIgnore>,
  columns: PgColumns,
  tableName: string
): SoftDeleteConfig {
  const { enabled, columnName } = options.softDelete || {}
  if (enabled && !columnName) {
    throw new Error(`[${tableName}]: 缺少软删除配置`)
  }
  if (enabled && columnName && !columns[columnName]) {
    throw new Error(`[${tableName}]: 不存在软删除字段`)
  }
  return {
    ...options.softDelete,
    column: columnName ? columns[columnName] : null,
  }
}
