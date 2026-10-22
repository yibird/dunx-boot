import type { InferInsertModel, InferSelectModel, SQL } from 'drizzle-orm'
import type {
  AnyPgColumn,
  PgAsyncDatabase,
  PgQueryResultHKT,
  PgTable,
} from 'drizzle-orm/pg-core'
import { AUDIT_COLUMNS } from './constant'

/**
 * 数据层的类型：表与行的推断结果、构造仓储的配置。
 *
 * 通用仓储本身在 `repository.ts`；把配置解析成 `CrudConfig` 的那一步在 `config/`
 * （那是内部实现，不出现在 `@/infra/crud` 的公开面上）。
 */

/**
 * 表对应的查询返回类型。
 */
export type CrudSelect<T extends PgTable> = InferSelectModel<T>
/**
 * 表对应的写入类型。
 */
export type CrudInsert<T extends PgTable> = InferInsertModel<T>
/**
 * 仓储返回的行：`TIgnore` 里的列不出现在结果里。
 *
 * `TIgnore` 是 select 字段的联合（`keyof CrudSelect<T>`），缺省 `never`
 * 表示不忽略任何列。忽略只影响**返回**，不影响写入——被忽略的列照常可以写。
 */
export type CrudRow<
  T extends PgTable,
  TIgnore extends keyof CrudSelect<T> = never,
> = Omit<CrudSelect<T>, TIgnore>

/**
 * 通用 CRUD 需要的数据库能力；`BunSQLDatabase` 等 drizzle 实例都可赋值。
 */
export type CrudDatabase = PgAsyncDatabase<PgQueryResultHKT>

/**
 * 表上可作为 CRUD 配置目标的列名。
 *
 * 配置项都接收列名而不是任意字符串，拼错会在编译期报错；构造时还会再校验一次。
 */
export type CrudColumn<TTable extends PgTable> = keyof TTable & string

/**
 * 审计字段；缺省按约定列名自动识别。
 */
export type CrudAuditField = keyof typeof AUDIT_COLUMNS

export type CrudTenantOptions = {
  /**
   * @desc 是否开启多租户，默认 true
   * @default true
   */
  readonly enabled?: boolean
  /**
   * @desc 租户列名
   * @default 'tenantId'
   */
  readonly columnName?: string
  /**
   * @desc 忽略的表名
   * @default []
   */
  readonly ignoreTables?: readonly string[]
}

/**
 * 软删除配置。
 *
 * `enabled: false` 走物理删除；列名缺省按约定 `deleted`。配置的列必须在表上，
 * 否则构造报错——表上没有软删列时要显式关掉。已删除值 / 未删除值缺省布尔
 * `true` / `false`。
 */
export interface CrudSoftDeleteOptions {
  /**
   * @desc 是否开启软删除，默认 true
   * @default true
   */
  readonly enabled?: boolean
  /**
   * @desc 软删除列名
   * @default 'deleted'
   */
  readonly columnName?: string
  /**
   * @desc 已删除值
   * @default true
   */
  readonly deletedValue?: unknown
  /**
   * @desc 未删除值
   * @default false
   */
  readonly notDeletedValue?: unknown
}

/**
 * 审计填充配置。
 *
 * `enabled: false` 整块关闭；`columns` 是 9 个审计字段的完整映射，值必须是表上的
 * 列名，缺一个就构造报错。缺省就是 `commonColumns` 的约定列名。
 */
export type CrudAuditOptions = {
  /**
   * @desc 是否开启审计填充，默认 true
   * @default true
   */
  readonly enabled?: boolean
  /**
   * @desc 各审计字段的列名
   */
  readonly columns?: Record<CrudAuditField, string>
}

export interface CrudOptimisticLockOptions {
  /**
   * @desc 是否开启乐观锁，默认 true
   * @default true
   */
  readonly enabled?: boolean
  /**
   * @desc 乐观锁列名
   * @default 'version'
   */
  readonly columnName?: string
}

export interface CrudQueryOptions {
  /**
   * @desc 过滤条件；缺省不设
   * @default
   */
  readonly where?: SQL | undefined
  /**
   * 排序；缺省用 `options.defaultOrderBy`，两者都没有就不带 ORDER BY
   */
  readonly orderBy?: readonly (SQL | AnyPgColumn)[]
}

/**
 * CrudRepository 配置
 *
 * @template TTable 目标表类型
 * @template TIgnore 查询忽略的列名类型
 */
export interface CrudRepositoryOptions<
  TTable extends PgTable = PgTable,
  TIgnore extends keyof CrudSelect<TTable> = never,
> {
  /**
   * 目标表
   */
  readonly table: TTable
  /**
   * @desc 主键列名
   * @default 'id'
   */
  readonly keyColumnName?: string
  /**
   * @desc 多租户配置；缺省按 `tenantId` 列自动启用
   * @default
   */
  readonly tenant?: CrudTenantOptions
  /**
   * @desc 软删除配置；缺省按 `deleted` 列自动启用
   * @default
   */
  readonly softDelete?: CrudSoftDeleteOptions
  /**
   * @desc 乐观锁配置
   * @default
   */
  readonly optimisticLock?: CrudOptimisticLockOptions
  /**
   * @desc 审计字段配置
   * @default
   */
  readonly audit?: CrudAuditOptions
  /**
   * @desc 查询忽略的列名集合
   * @default []
   */
  readonly ignoreColumns?: readonly TIgnore[]
  /**
   * @desc 忽略的写入列名集合（create 与 update 都会剔除）
   * @default []
   */
  readonly ignoreWriteColumns?: readonly CrudColumn<TTable>[]
  /**
   * @desc 读查询是否走 drizzle 查询缓存（`$withCache()`）；缺省关闭
   * @default false
   */
  readonly cache?: boolean
  /**
   * @desc 叠加在所有读/改/删上的静态过滤条件（如 `eq(table.dataStatus, true)`）
   * @default
   */
  readonly defaultWhere?: SQL
  /**
   * @desc 默认排序；缺省不排序（需要稳定的分页顺序就显式给，否则跨页可能重复/漏行）
   * @default
   */
  readonly defaultOrderBy?: readonly (SQL | AnyPgColumn)[]
}

/**
 * 插入/更新/删除的参数。
 */
export type CrudPayload = Record<string, unknown>
/**
 * 写入模式
 */
export type CrudWriteMode = 'create' | 'update' | 'delete'
