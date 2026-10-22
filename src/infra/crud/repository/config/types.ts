import type { PgColumn, PgTable } from 'drizzle-orm/pg-core'
import type {
  CrudAuditField,
  CrudAuditOptions,
  CrudOptimisticLockOptions,
  CrudRepositoryOptions,
  CrudSelect,
  CrudSoftDeleteOptions,
  CrudTenantOptions,
} from '../types'

/**
 * 主键配置
 */
export interface CrudKeyConfig {
  /**
   * 主键列名
   */
  readonly columnName: string
  /**
   * drizzle 列对象
   */
  readonly column: PgColumn
}

/**
 * 租户配置
 */
export interface CrudTenantConfig extends CrudTenantOptions {
  /**
   * 租户列对象
   */
  readonly column: PgColumn | null | undefined
}

/**
 * 审计填充配置
 */
export interface CrudAuditConfig extends CrudAuditOptions {
  /**
   * 各审计字段的列名
   */
  readonly auditColumns:
    | Record<CrudAuditField, PgColumn | null | undefined>
    | null
    | undefined
}

/**
 * 软删除配置
 */
export interface SoftDeleteConfig extends CrudSoftDeleteOptions {
  /**
   * 软删除列对象
   */
  readonly column: PgColumn | null | undefined
}

/**
 * 乐观锁配置
 */
export interface CrudOptimisticLockConfig extends CrudOptimisticLockOptions {
  /**
   * 乐观锁列对象
   */
  readonly column: PgColumn | null | undefined
}

/**
 * 表上的列集合（列名 → drizzle 列对象）。
 *
 * drizzle 0.45 没有导出一个现成的 `PgColumns` 类型（只有列构建器名），
 * 这里给表列集合补一个别名，语义就是 `getTableColumns()` 的返回形状。
 */
export type PgColumns = Record<string, PgColumn>

/**
 * CRUD 配置
 */
export interface CrudConfig<
  TTable extends PgTable,
  TIgnore extends keyof CrudSelect<TTable> = never,
> {
  /**
   * CRUD Options
   */
  readonly options?: CrudRepositoryOptions<TTable, TIgnore>
  /**
   * 表名
   */
  readonly tableName?: string
  /**
   * 查询时返回的列集合
   */
  readonly selectColumns: PgColumns
  /**
   * 主键配置
   */
  readonly key: CrudKeyConfig
  /**
   * 租户配置
   */
  readonly tenant?: CrudTenantConfig | null | undefined
  /**
   * 审计配置
   */
  readonly audit?: CrudAuditConfig | null | undefined
  /**
   * 软删除配置
   */
  readonly softDelete?: SoftDeleteConfig | null | undefined
  /**
   * 乐观锁配置
   */
  readonly optimisticLock?: CrudOptimisticLockConfig | null | undefined
}
