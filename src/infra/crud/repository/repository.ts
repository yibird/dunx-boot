import { inject } from '@dunx/core'
import { count, eq, getTableColumns, inArray } from 'drizzle-orm'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { omit } from 'es-toolkit'
import { PluginManager } from './plugin'
import { defaultPlugins, mergePlugins } from './defaults'
import { Pager, type BaseQuery } from '../../model'
import { mergeAnd, mergeGroupBy, mergeOrderBy } from '../../db/utils'
import type { PgColumn, PgTable, PgUpdateSetSource } from 'drizzle-orm/pg-core'
import type {
  CreateManyContext,
  CreateSingleContext,
  CrudCreate,
  CrudOperation,
  CrudQueryOptions,
  CrudRow,
  CrudUpdate,
  DeleteContext,
  QueryContext,
  QueryOptions,
  RepositoryOptions,
  UpdateContext,
} from './types'

/**
 * 获取查询列,根据忽略的列名集合剔除查询列
 *
 * @param table 表
 * @param ignoreColumns 忽略的列名集合
 * @returns 剔除忽略列后的查询列
 */
function getSelectColumns<
  TTable extends PgTable,
  TIgnore extends keyof TTable['_']['columns'],
>(
  table: TTable,
  ignoreColumns: readonly TIgnore[]
): Omit<TTable['_']['columns'], TIgnore> {
  return omit(getTableColumns(table), ignoreColumns) as Omit<
    TTable['_']['columns'],
    TIgnore
  >
}

/**
 * 基于插件的 CRUD 仓储
 *
 * 核心职责：
 * - 提供基础 CRUD 操作
 * - 协调插件执行
 * - 保持类型安全
 */
export class CrudRepository<
  TTable extends PgTable = PgTable,
  TIgnore extends keyof TTable['_']['columns'] = never,
> {
  // 表
  protected readonly table: TTable
  // 主键列
  protected readonly keyColumn: string
  // 主键列定义
  protected readonly keyColumnDef: PgColumn
  // 数据库实例
  protected readonly db: BunSQLDatabase
  // 插件管理器
  protected readonly pluginManager: PluginManager<TTable>
  // 查询选项
  protected readonly queryOptions?: CrudQueryOptions
  // 查询列
  protected readonly selectColumns: Omit<TTable['_']['columns'], TIgnore>
  // 忽略的列名集合
  protected readonly ignoreColumns: readonly TIgnore[]

  constructor(
    options: RepositoryOptions<TTable, TIgnore>,
    db?: BunSQLDatabase
  ) {
    const plugins = mergePlugins(defaultPlugins<TTable>(), options.plugins)
    this.table = options.table
    this.keyColumn = options.keyColumn ?? 'id'
    this.keyColumnDef = (
      getTableColumns(this.table) as Record<string, PgColumn>
    )[this.keyColumn] as PgColumn
    this.db = db ?? inject(BunSQLDatabase)
    this.pluginManager = new PluginManager(plugins)
    this.queryOptions = options.queryOptions
    this.ignoreColumns = options.ignoreColumns ?? []
    this.selectColumns = getSelectColumns(this.table, this.ignoreColumns)
  }

  /**
   * 插入查询。
   *
   * drizzle 在 `TTable` 为泛型参数时无法完成 insert 的写入类型推导，
   * 这里只在仓储内部把表宽化为 `PgTable`；对外的 `create` / `createMany`
   * 仍然使用 `CrudCreate<TTable>` 的强类型。
   */
  private insertQuery(
    values: Record<string, unknown> | Record<string, unknown>[]
  ) {
    return this.db.insert(this.table as PgTable).values(values)
  }

  /**
   * 创建操作上下文
   */
  protected createContext<T extends CrudOperation>(
    operation: T
  ): {
    table: TTable
    db: BunSQLDatabase
    operation: T
    metadata: Map<string, unknown>
  } {
    return {
      table: this.table,
      db: this.db,
      operation,
      metadata: new Map(),
    }
  }

  /**
   * 分页查询
   */
  async getPageList<TQuery extends Partial<BaseQuery> = Partial<BaseQuery>>(
    query: TQuery,
    options?: QueryOptions
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    const pagination = Pager.getPagination(query)
    const context: QueryContext<TTable> = {
      ...this.createContext('query'),
      options: {
        where: mergeAnd(this.queryOptions?.where, options?.where),
        orderBy: mergeOrderBy(this.queryOptions?.orderBy, options?.orderBy),
        groupBy: mergeGroupBy(this.queryOptions?.groupBy, options?.groupBy),
        limit: pagination.pageSize,
        offset: pagination.offset,
      },
      query,
    }

    await this.pluginManager.beforeQuery(context)

    const { where, orderBy, groupBy, limit, offset } = context.options
    const dataQuery = this.db
      .select(this.selectColumns)
      .from(this.table as PgTable)
      .where(where)
      .$dynamic()
    if (groupBy?.length) dataQuery.groupBy(...groupBy)
    const rows = (await dataQuery
      .orderBy(...(orderBy ?? []))
      .limit(limit!)
      .offset(offset!)) as CrudRow<TTable>[]

    const resultContext = {
      ...context,
      result: rows,
    }
    await this.pluginManager.afterQuery(resultContext)

    return resultContext.result as CrudRow<TTable, TIgnore>[]
  }

  /**
   * 查询列表（不分页）
   */
  async getMany(options?: QueryOptions): Promise<CrudRow<TTable, TIgnore>[]> {
    const context: QueryContext<TTable> = {
      ...this.createContext('query'),
      options: {
        where: mergeAnd(this.queryOptions?.where, options?.where),
        orderBy: mergeOrderBy(this.queryOptions?.orderBy, options?.orderBy),
        groupBy: mergeGroupBy(this.queryOptions?.groupBy, options?.groupBy),
      },
      query: {},
    }

    await this.pluginManager.beforeQuery(context)

    const { where, orderBy, groupBy } = context.options
    const dataQuery = this.db
      .select(this.selectColumns)
      .from(this.table as PgTable)
      .where(where)
      .$dynamic()
    if (groupBy?.length) dataQuery.groupBy(...groupBy)
    const rows = (await dataQuery.orderBy(
      ...(orderBy ?? [])
    )) as CrudRow<TTable>[]

    const resultContext = {
      ...context,
      result: rows,
    }
    await this.pluginManager.afterQuery(resultContext)
    return resultContext.result as CrudRow<TTable, TIgnore>[]
  }

  /**
   * 根据主键查询
   */
  async findById(id: string): Promise<CrudRow<TTable, TIgnore> | undefined> {
    const keyCol = this.keyColumnDef
    const context: QueryContext<TTable> = {
      ...this.createContext('query'),
      options: {
        where: mergeAnd(this.queryOptions?.where, eq(keyCol, id)),
      },
      query: { id },
    }

    await this.pluginManager.beforeQuery(context)

    const [row] = (await this.db
      .select(this.selectColumns)
      .from(this.table as PgTable)
      .where(context.options.where)
      .limit(1)) as CrudRow<TTable>[]

    const resultContext = {
      ...context,
      result: row,
    }
    await this.pluginManager.afterQuery(resultContext)
    return resultContext.result as CrudRow<TTable, TIgnore> | undefined
  }

  /**
   * 统计记录数
   */
  async count(options?: QueryOptions): Promise<number> {
    const context: QueryContext<TTable> = {
      ...this.createContext('count'),
      options: {
        where: mergeAnd(this.queryOptions?.where, options?.where),
      },
      query: {},
    }

    await this.pluginManager.beforeQuery(context)

    const [row] = await this.db
      .select({ total: count() })
      .from(this.table as PgTable)
      .where(context.options.where)

    return (row as { total: number } | undefined)?.total ?? 0
  }

  /**
   * 创建单条记录
   */
  async create(input: CrudCreate<TTable>): Promise<CrudRow<TTable, TIgnore>> {
    const context: CreateSingleContext<TTable> = {
      ...this.createContext('create'),
      values: { ...input },
      input,
    }

    await this.pluginManager.beforeCreate(context)

    const [row] = (await this.insertQuery(context.values).returning(
      this.selectColumns
    )) as CrudRow<TTable>[]

    if (!row) {
      throw new Error('Create failed: no row returned')
    }

    const resultContext = {
      ...context,
      result: row,
    }
    await this.pluginManager.afterCreate(resultContext)

    return resultContext.result as CrudRow<TTable, TIgnore>
  }

  /**
   * 批量创建
   */
  async createMany(
    inputs: CrudCreate<TTable>[]
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    if (inputs.length === 0) return []

    const context: CreateManyContext<TTable> = {
      ...this.createContext('createMany'),
      values: inputs.map((input) => ({ ...input })),
      input: inputs,
    }

    await this.pluginManager.beforeCreate(context)

    const rows = (await this.insertQuery(context.values).returning(
      this.selectColumns
    )) as CrudRow<TTable>[]

    const resultContext = {
      ...context,
      result: rows,
    }
    await this.pluginManager.afterCreate(resultContext)

    return resultContext.result as CrudRow<TTable, TIgnore>[]
  }

  /**
   * 更新单条记录
   */
  async update(
    id: string,
    input: CrudUpdate<TTable>
  ): Promise<CrudRow<TTable, TIgnore>> {
    const keyCol = this.keyColumnDef
    const context: UpdateContext<TTable> = {
      ...this.createContext('update'),
      id,
      values: { ...input },
      where: mergeAnd(this.queryOptions?.where, eq(keyCol, id)),
      input,
    }

    await this.pluginManager.beforeUpdate(context)

    const [row] = (await this.db
      .update(this.table)
      .set(context.values as PgUpdateSetSource<TTable>)
      .where(context.where)
      .returning(this.selectColumns)) as CrudRow<TTable>[]

    const resultContext = {
      ...context,
      result: row,
    }
    await this.pluginManager.afterUpdate(resultContext)

    if (!resultContext.result) {
      throw new Error(`Update failed: record ${id} not found`)
    }

    return resultContext.result as CrudRow<TTable, TIgnore>
  }

  /**
   * 批量更新
   */
  async updateMany(
    ids: string[],
    input: CrudUpdate<TTable>
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    if (ids.length === 0) return []

    const keyCol = this.keyColumnDef
    const context: UpdateContext<TTable> = {
      ...this.createContext('updateMany'),
      id: ids,
      values: { ...input },
      where: mergeAnd(this.queryOptions?.where, inArray(keyCol, ids)),
      input,
    }

    await this.pluginManager.beforeUpdate(context)

    const rows = (await this.db
      .update(this.table)
      .set(context.values as PgUpdateSetSource<TTable>)
      .where(context.where)
      .returning(this.selectColumns)) as CrudRow<TTable>[]

    const resultContext = {
      ...context,
      result: rows,
    }
    await this.pluginManager.afterUpdate(resultContext)

    return resultContext.result as CrudRow<TTable, TIgnore>[]
  }

  /**
   * 删除单条记录
   */
  async delete(
    id: string,
    softDelete?: boolean
  ): Promise<CrudRow<TTable, TIgnore>> {
    const keyCol = this.keyColumnDef
    const context: DeleteContext<TTable> = {
      ...this.createContext('delete'),
      id,
      where: mergeAnd(this.queryOptions?.where, eq(keyCol, id)),
      softDelete,
    }

    await this.pluginManager.beforeDelete(context)

    let row: CrudRow<TTable> | undefined
    if (context.softDelete && context.values) {
      ;[row] = (await this.db
        .update(this.table)
        .set(context.values as PgUpdateSetSource<TTable>)
        .where(context.where)
        .returning(this.selectColumns)) as CrudRow<TTable>[]
    } else {
      ;[row] = (await this.db
        .delete(this.table)
        .where(context.where)
        .returning(this.selectColumns)) as CrudRow<TTable>[]
    }

    if (!row) {
      throw new Error(`Delete failed: record ${id} not found`)
    }

    const resultContext = {
      ...context,
      result: row,
    }
    await this.pluginManager.afterDelete(resultContext)

    return resultContext.result as CrudRow<TTable, TIgnore>
  }

  /**
   * 批量删除
   */
  async deleteMany(
    ids: string[],
    softDelete?: boolean
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    if (ids.length === 0) return []

    const keyCol = this.keyColumnDef
    const context: DeleteContext<TTable> = {
      ...this.createContext('deleteMany'),
      id: ids,
      where: mergeAnd(this.queryOptions?.where, inArray(keyCol, ids)),
      softDelete,
    }

    await this.pluginManager.beforeDelete(context)

    let rows: CrudRow<TTable>[]
    if (context.softDelete && context.values) {
      rows = (await this.db
        .update(this.table)
        .set(context.values as PgUpdateSetSource<TTable>)
        .where(context.where)
        .returning(this.selectColumns)) as CrudRow<TTable>[]
    } else {
      rows = (await this.db
        .delete(this.table)
        .where(context.where)
        .returning(this.selectColumns)) as CrudRow<TTable>[]
    }

    const resultContext = {
      ...context,
      result: rows,
    }
    await this.pluginManager.afterDelete(resultContext)

    return resultContext.result as CrudRow<TTable, TIgnore>[]
  }
}
