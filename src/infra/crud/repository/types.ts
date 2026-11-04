import type { InferInsertModel, InferSelectModel, SQL } from 'drizzle-orm'
import type {
  AnyPgColumn,
  PgAsyncDatabase,
  PgQueryResultHKT,
  PgTable,
} from 'drizzle-orm/pg-core'
import type { CrudPlugin } from './plugin'

/**
 * 通用 CRUD 需要的数据库能力；BunSQLDatabase 与事务句柄都满足。
 */
export type CrudDatabase = PgAsyncDatabase<PgQueryResultHKT>

/**
 * 表对应的写入类型
 */
export type CrudInsert<TTable extends PgTable> = InferInsertModel<TTable>

/**
 * 表对应的查询结果类型；`TIgnore` 中的列不会出现在结果里。
 */
export type CrudRow<
  TTable extends PgTable,
  TIgnore extends keyof TTable['_']['columns'] = never,
> = Omit<InferSelectModel<TTable>, TIgnore>

/**
 * 新增字段：由 drizzle 推导出的必填/可选列
 */
export type CrudCreate<TTable extends PgTable> = CrudInsert<TTable>

/**
 * 更新字段：允许只提交需要修改的列
 */
export type CrudUpdate<TTable extends PgTable> = Partial<CrudInsert<TTable>>

/**
 * 单条或批量操作的结果
 */
export type CrudResult<TTable extends PgTable> =
  | CrudRow<TTable>
  | CrudRow<TTable>[]
  | undefined

/**
 * CRUD 操作类型
 */
export type CrudOperation =
  | 'query'
  | 'count'
  | 'create'
  | 'update'
  | 'delete'
  | 'createMany'
  | 'updateMany'
  | 'deleteMany'

/**
 * 查询选项
 */
export interface CrudQueryOptions {
  /**
   * 当前的 where 条件；插件可以通过重新赋值叠加条件
   */
  where?: SQL | undefined
  orderBy?: (SQL | AnyPgColumn)[] | undefined
  groupBy?: (SQL | AnyPgColumn)[] | undefined
  limit?: number | undefined
  offset?: number | undefined
}

/**
 * 操作上下文基类
 */
export interface BaseContext<TTable extends PgTable = PgTable> {
  /**
   * 目标表
   */
  readonly table: TTable
  /**
   * 数据库连接
   */
  readonly db: CrudDatabase
  /**
   * 操作类型
   */
  readonly operation: CrudOperation
  /**
   * 元数据：插件间传递数据
   */
  readonly metadata: Map<string, unknown>
}

/**
 * 查询上下文
 */
export interface QueryContext<
  TTable extends PgTable = PgTable,
> extends BaseContext<TTable> {
  readonly operation: 'query' | 'count'
  /**
   * 查询选项（可修改）
   */
  options: CrudQueryOptions
  /**
   * 原始查询参数
   */
  readonly query: Record<string, unknown>
}

/**
 * 单条创建上下文
 */
export interface CreateSingleContext<
  TTable extends PgTable = PgTable,
> extends BaseContext<TTable> {
  readonly operation: 'create'
  /**
   * 待写入数据（可修改）
   */
  values: CrudCreate<TTable>
  /**
   * 原始输入
   */
  readonly input: CrudCreate<TTable>
}

/**
 * 批量创建上下文
 */
export interface CreateManyContext<
  TTable extends PgTable = PgTable,
> extends BaseContext<TTable> {
  readonly operation: 'createMany'
  /**
   * 待写入数据（可修改）
   */
  values: CrudCreate<TTable>[]
  /**
   * 原始输入
   */
  readonly input: CrudCreate<TTable>[]
}

/**
 * 创建上下文联合类型；插件可按 operation 或 Array.isArray 收窄
 */
export type CreateContext<TTable extends PgTable = PgTable> =
  | CreateSingleContext<TTable>
  | CreateManyContext<TTable>

/**
 * 更新上下文
 */
export interface UpdateContext<
  TTable extends PgTable = PgTable,
> extends BaseContext<TTable> {
  readonly operation: 'update' | 'updateMany'
  /**
   * 目标记录 ID
   */
  readonly id: string | string[]
  /**
   * 更新数据（可修改）
   */
  values: CrudUpdate<TTable>
  /**
   * where 条件（可修改）
   */
  where?: SQL | undefined
  /**
   * 原始输入
   */
  readonly input: CrudUpdate<TTable>
}

/**
 * 删除上下文
 */
export interface DeleteContext<
  TTable extends PgTable = PgTable,
> extends BaseContext<TTable> {
  readonly operation: 'delete' | 'deleteMany'
  /**
   * 目标记录 ID
   */
  readonly id: string | string[]
  /**
   * where 条件（可修改）
   */
  where?: SQL | undefined
  /**
   * 是否软删除（可修改）
   */
  softDelete?: boolean | undefined
  /**
   * 软删除数据（插件填充）
   */
  values?: CrudUpdate<TTable> | undefined
}

/**
 * 结果上下文
 */
export interface ResultContext<
  TTable extends PgTable = PgTable,
> extends BaseContext<TTable> {
  /**
   * 操作结果（可修改）
   */
  result: CrudResult<TTable>
}

/**
 * 操作上下文联合类型
 */
export type OperationContext<TTable extends PgTable = PgTable> =
  | QueryContext<TTable>
  | CreateContext<TTable>
  | UpdateContext<TTable>
  | DeleteContext<TTable>

/**
 * 查询的可选覆盖项
 *
 * 传入后与仓储默认条件合并，插件仍可在 `beforeQuery` 中继续修改。
 */
export interface QueryOptions {
  /**
   * where 条件
   */
  where?: SQL | undefined
  /**
   * 排序
   */
  orderBy?: (SQL | AnyPgColumn)[] | undefined
  /**
   * 分组
   */
  groupBy?: (SQL | AnyPgColumn)[] | undefined
}

/**
 * 仓储配置
 */
export interface RepositoryOptions<
  TTable extends PgTable,
  TIgnore extends keyof TTable['_']['columns'] = never,
> {
  /**
   * 目标表
   */
  table: TTable
  /**
   * 主键列名
   */
  keyColumn?: string
  /**
   * 插件列表
   */
  plugins?: CrudPlugin<TTable>[]
  /**
   * 查询结果中不返回的列名，必须是表字段名；不影响写入。
   */
  ignoreColumns?: readonly TIgnore[]
  /**
   * 查询配置,包含默认排序、分组、分页等
   */
  queryOptions: CrudQueryOptions
}
