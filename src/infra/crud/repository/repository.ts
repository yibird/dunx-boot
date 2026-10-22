import { count, eq, inArray, sql, type SQL } from 'drizzle-orm'
import { inject } from '@dunx/core'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { omit } from 'es-toolkit'
import { pipe } from 'es-toolkit/fp'
import { fillAudit, fillTenant, getOptions } from './util'
import { getTenantId } from '@/infra/context'
import { AppError, ConflictError } from '@/errors'
import { AssertUtils } from '@/utils'
import { mergeAnd } from '../../db/utils'
import { Pager, type BaseQuery } from '../../model'
import { getConfig, type CrudConfig } from './config'

import type {
  AnyPgColumn,
  PgTable,
  PgUpdateSetSource,
} from 'drizzle-orm/pg-core'
import type { CrudId } from '../types'
import type {
  CrudDatabase,
  CrudInsert,
  CrudPayload,
  CrudQueryOptions,
  CrudRepositoryOptions,
  CrudRow,
  CrudSelect,
} from './types'

/**
 * 通用 CRUD 仓储。
 *
 * 统一处理租户隔离、软删除、审计字段、查询缓存和乐观锁。
 */

export abstract class CrudRepository<
  TTable extends PgTable = PgTable,
  TIgnore extends keyof CrudSelect<TTable> = never,
> {
  // 表实例
  protected readonly table: PgTable
  // database实例
  readonly #db: CrudDatabase
  // 配置项
  readonly #config: CrudConfig<TTable, TIgnore>

  /**
   * 将业务查询参数转换为仓储查询条件。
   * 子类可覆盖此方法，根据具体查询参数生成过滤条件和排序规则。
   *
   * @param _query - 原始查询参数
   * @returns 查询条件和排序配置；默认不附加额外条件
   */
  protected getQueryOptions(
    _query: Partial<BaseQuery>
  ): CrudQueryOptions | undefined {
    return undefined
  }

  /**
   * 创建 CRUD 仓储实例并解析仓储配置。未显式传入数据库实例时，从依赖注入容器获取默认数据库。
   *
   * @param options - 仓储配置
   * @param db - 可选的数据库实例
   */
  constructor(
    options: CrudRepositoryOptions<TTable, TIgnore> | undefined = undefined,
    db: CrudDatabase | undefined = undefined
  ) {
    const resolvedOptions = getOptions(options)
    this.table = resolvedOptions.table
    this.#config = getConfig(resolvedOptions)
    this.#db = db ?? inject(BunSQLDatabase)
  }

  /**
   * 合并默认条件、业务条件、租户条件和软删除条件。
   *
   * @param where - 业务查询条件
   * @param includeDeleted - 是否包含已软删除的数据
   * @returns 合并后的查询条件
   */
  protected scope(where?: SQL, includeDeleted = false) {
    const defaultWhere = this.#config.options?.defaultWhere
    return mergeAnd(
      defaultWhere,
      where,
      this.#tenantWhere(),
      includeDeleted ? undefined : this.#softDeleteWhere()
    )
  }

  /**
   * 构造新增数据。
   *
   * 过滤禁止写入的字段，并填充创建审计字段及租户字段。
   *
   * @param input - 待新增的数据
   * @returns 处理后的新增数据
   */
  protected createValues(input: Partial<CrudInsert<TTable>>) {
    const ignoreWriteColumns = this.#config.options?.ignoreWriteColumns ?? []
    return pipe(
      input,
      (payload) => omit(payload as CrudPayload, ignoreWriteColumns),
      (payload) => fillAudit(payload, 'create', this.#config.audit),
      (payload) => fillTenant(payload, this.#config.tenant)
    ) as CrudPayload
  }

  /**
   * 构造更新数据。过滤禁止写入的字段、填充更新审计字段，并设置版本递增表达式。
   *
   * @param input - 待更新的数据
   * @returns 处理后的更新数据
   */
  protected updateValues(input: Partial<CrudInsert<TTable>>): CrudPayload {
    const ignoreWriteColumns = this.#config.options?.ignoreWriteColumns ?? []
    return pipe(
      input,
      (payload) => omit(payload as CrudPayload, ignoreWriteColumns),
      (payload) => fillAudit(payload, 'update', this.#config.audit),
      (payload) => this.#incrementVersion(payload)
    ) as CrudPayload
  }

  /**
   * 构造软删除数据。设置软删除字段和删除值，同时填充更新审计字段并递增版本号。
   *
   * @returns 处理后的软删除数据
   * @throws 配置未提供软删除字段或删除值时抛出异常
   */
  protected deleteValues(): CrudPayload {
    const { columnName, deletedValue } = this.#config.softDelete ?? {}
    if (!columnName || deletedValue === undefined) {
      throw new AppError({ message: '软删除配置不完整，缺少删除字段或删除值' })
    }
    const payload = { [columnName]: deletedValue } as CrudPayload
    return this.#incrementVersion(
      fillAudit(payload, 'update', this.#config.audit)
    )
  }

  /**
   * 根据主键生成查询条件。
   *
   * @param id - 记录主键
   * @returns 主键匹配条件
   */
  #idWhere(id: string | number): SQL {
    return eq(this.#config.key.column, id)
  }

  /**
   * 根据当前上下文生成租户隔离条件。未启用租户隔离或未配置租户字段时，不附加租户条件。
   *
   * @returns 租户条件；未启用时返回 undefined
   */
  #tenantWhere(): SQL | undefined {
    const { enabled, column } = this.#config.tenant ?? {}
    if (!enabled || !column) return
    return eq(column, getTenantId())
  }

  /**
   * 生成仅查询未删除记录的条件。
   *
   * @returns 软删除过滤条件；未启用或配置不完整时返回 undefined
   */
  #softDeleteWhere(): SQL | undefined {
    const { enabled, column, notDeletedValue } = this.#config.softDelete ?? {}
    if (!enabled || !column || notDeletedValue === undefined) return
    return eq(column, notDeletedValue)
  }

  /**
   * 解析排序规则，优先使用调用方提供的排序，否则使用默认排序。
   *
   * @param orderBy - 调用方指定的排序规则
   * @returns 最终使用的排序规则
   */
  #orderBy(orderBy?: readonly (SQL<unknown> | AnyPgColumn)[] | undefined) {
    const defaultOrderBy = this.#config.options?.defaultOrderBy ?? []
    return orderBy?.length ? orderBy : defaultOrderBy
  }

  /**
   * 根据预期版本号生成乐观锁条件。未启用乐观锁时不附加版本条件；启用后要求提供完整配置和预期版本号。
   *
   * @param expected - 调用方读取记录时持有的版本号
   * @returns 版本匹配条件；未启用乐观锁时返回 undefined
   */
  #versionWhere(expected: unknown): SQL | undefined {
    const { columnName, column } = this.#config.optimisticLock ?? {}
    if (!columnName && !column) return
    if (!columnName || !column) {
      throw new AppError({ message: '乐观锁配置不完整，缺少版本字段或字段名' })
    }
    if (expected === undefined) {
      throw new AppError({ message: '更新数据缺少预期版本号' })
    }
    return eq(column, expected)
  }

  /**
   * 根据仓储配置决定是否为查询启用缓存。
   *
   * @param query - Drizzle 查询构建器
   * @returns 原查询或启用缓存后的查询
   */
  #cached<T extends object>(query: T): T {
    if (!this.#config.options?.cache) return query
    return (query as T & { $withCache: () => T }).$withCache()
  }

  /**
   * 从输入数据中读取预期版本号。
   *
   * @param input - 写入数据，版本字段用于乐观锁校验
   * @returns 预期版本号；未启用乐观锁时返回 undefined
   */
  #getExpectedVersion(input: Partial<CrudInsert<TTable>>): unknown {
    const { columnName } = this.#config.optimisticLock ?? {}
    if (!columnName) return undefined
    return Reflect.get(input, columnName)
  }

  /**
   * 为写入数据设置数据库端的版本递增表达式。使用 SQL 表达式执行 version + 1，避免在应用层读取并计算版本号。
   *
   * @param payload - 待写入的数据
   * @returns 添加版本递增表达式后的数据
   */
  #incrementVersion(payload: CrudPayload): CrudPayload {
    const { columnName, column } = this.#config.optimisticLock ?? {}
    if (columnName && column) {
      Reflect.set(payload, columnName, sql`${column} + 1`)
    }
    return payload
  }

  /**
   * 判断更新未命中时是否由乐观锁版本不匹配导致。直接查询数据库中的当前版本，不使用查询缓存。
   *
   * @param id - 记录主键
   * @param expected - 调用方持有的预期版本号
   * @returns 记录仍存在且版本不匹配时返回 true
   */
  async #hasVersionConflict(id: CrudId, expected: unknown): Promise<boolean> {
    const { columnName, column } = this.#config.optimisticLock ?? {}
    if (!columnName || !column || expected === undefined) return false
    const [current] = await this.#db
      .select({ version: column })
      .from(this.table)
      .where(mergeAnd(this.#idWhere(id), this.#tenantWhere()))
      .limit(1)
    return current?.version !== expected
  }

  /**
   * 解析查询条件和排序规则，并应用统一的数据访问范围。
   *
   * @param query - 原始查询参数
   * @returns 经过数据范围约束的查询条件及排序规则
   */
  #getQueryParts<TQuery extends Partial<BaseQuery>>(query: TQuery) {
    const { where, orderBy } = this.getQueryOptions(query) ?? {}
    return {
      where: this.scope(where),
      orderBy: this.#orderBy(orderBy),
    }
  }

  /**
   * 分页查询记录。根据分页参数计算 limit/offset，并应用查询条件、排序和缓存配置。
   *
   * @param query - 查询及分页参数
   * @returns 当前页的记录列表
   */
  async findPage<TQuery extends Partial<BaseQuery>>(
    query: TQuery
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    const { pageSize, offset } = Pager.getPagination(query)
    const { where, orderBy } = this.#getQueryParts(query)
    const rows = await this.#cached(
      this.#db
        .select(this.#config.selectColumns)
        .from(this.table)
        .where(where)
        .orderBy(...orderBy)
        .limit(pageSize)
        .offset(offset)
    )
    return rows as CrudRow<TTable, TIgnore>[]
  }

  /**
   * 按查询条件获取记录列表，不限制返回数量。
   *
   * @param query - 查询参数
   * @returns 符合条件的记录列表
   */
  async findMany<TQuery extends Partial<BaseQuery>>(
    query: TQuery
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    const { where, orderBy } = this.#getQueryParts(query)
    const dataRows = this.#db
      .select(this.#config.selectColumns)
      .from(this.table)
      .where(where)
      .orderBy(...orderBy)
      .$dynamic()
    const rows = await this.#cached(dataRows)
    return rows as CrudRow<TTable, TIgnore>[]
  }

  /**
   * 根据主键查询单条记录。可额外传入查询条件；结果仍受默认条件、租户隔离和软删除规则约束。
   *
   * @param id - 记录主键
   * @param where - 附加查询条件
   * @returns 匹配的记录；不存在时返回 undefined
   */
  async findById(
    id: CrudId,
    where?: SQL
  ): Promise<CrudRow<TTable, TIgnore> | undefined> {
    const [row] = await this.#cached(
      this.#db
        .select(this.#config.selectColumns)
        .from(this.table)
        .where(mergeAnd(this.#idWhere(id), this.scope(), where))
        .limit(1)
    )
    return row as CrudRow<TTable, TIgnore> | undefined
  }

  /**
   * 统计符合查询条件的记录数量。
   *
   * @param query - 查询参数
   * @returns 匹配记录总数
   */
  async count<TQuery extends Partial<BaseQuery>>(
    query: TQuery
  ): Promise<number> {
    const { where } = this.#getQueryParts(query)
    const [row] = await this.#cached(
      this.#db.select({ total: count() }).from(this.table).where(where)
    )
    return (row as { total: number } | undefined)?.total ?? 0
  }

  /**
   * 创建单条记录。写入前会统一处理可写字段、审计字段和租户字段。
   *
   * @param input - 待创建的数据
   * @returns 数据库返回的已创建记录
   * @throws 数据库未返回创建结果时抛出异常
   */
  async create(
    input: Partial<CrudInsert<TTable>>
  ): Promise<CrudRow<TTable, TIgnore>> {
    const payload = this.createValues(input) as CrudInsert<TTable>
    const [row] = await this.#db
      .insert(this.table)
      .values(payload)
      .returning(this.#config.selectColumns)
    AssertUtils.notNull(
      row,
      new AppError({ message: `创建 ${this.#config?.tableName} 失败` })
    )
    return row as CrudRow<TTable, TIgnore>
  }

  /**
   * 批量创建记录。空数组会直接返回，不执行数据库操作。
   *
   * @param inputs - 待创建的数据列表
   * @returns 数据库返回的已创建记录列表
   */
  async createMany(
    inputs: Partial<CrudInsert<TTable>>[]
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    if (inputs.length === 0) return []
    const payloads = inputs.map((input) =>
      this.createValues(input)
    ) as CrudInsert<TTable>[]
    const rows = await this.#db
      .insert(this.table)
      .values(payloads)
      .returning(this.#config.selectColumns)
    return rows as CrudRow<TTable, TIgnore>[]
  }

  /**
   * 根据主键更新单条记录。启用乐观锁时，输入数据必须包含预期版本号；更新未命中时会进一步判断版本冲突。
   *
   * @param id - 记录主键
   * @param input - 待更新的数据
   * @returns 数据库返回的已更新记录
   * @throws 版本冲突或更新失败时抛出异常
   */
  async update(
    id: CrudId,
    input: Partial<CrudInsert<TTable>>
  ): Promise<CrudRow<TTable, TIgnore>> {
    const payload = this.updateValues(input) as PgUpdateSetSource<TTable>
    const expected = this.#getExpectedVersion(input)
    const where = mergeAnd(
      this.#idWhere(id),
      this.scope(),
      this.#versionWhere(expected)
    )

    const [row] = await this.#db
      .update(this.table)
      .set(payload)
      .where(where)
      .returning(this.#config.selectColumns)

    if (!row) {
      if (await this.#hasVersionConflict(id, expected)) {
        throw new ConflictError('数据已被修改，请刷新后重试')
      }
      throw new Error(`CrudRepository: 更新 ${this.#config?.tableName} 失败`)
    }
    return row as CrudRow<TTable, TIgnore>
  }

  /**
   * 批量更新指定主键对应的记录。此方法不逐条校验预期版本号；启用乐观锁时只会在更新表达式中递增版本号。
   *
   * @param ids - 需要更新的记录主键列表
   * @param input - 所有匹配记录共用的更新数据
   * @returns 数据库返回的已更新记录列表
   */
  async updateMany(
    ids: CrudId[],
    input: Partial<CrudInsert<TTable>>
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    if (!ids.length) return []
    const payload = this.updateValues(input) as PgUpdateSetSource<TTable>
    const where = mergeAnd(inArray(this.#config.key.column, ids), this.scope())
    const rows = await this.#db
      .update(this.table)
      .set(payload)
      .where(where)
      .returning(this.#config.selectColumns)
    return rows as CrudRow<TTable, TIgnore>[]
  }

  /**
   * 根据主键删除单条记录。默认使用仓储配置决定软删除或物理删除，也可通过参数覆盖。
   *
   * @param id - 记录主键
   * @param softDelete - 是否使用软删除
   * @returns 删除前或软删除后的记录
   * @throws 未能删除记录时抛出异常
   */
  async delete(
    id: CrudId,

    softDelete?: boolean
  ): Promise<CrudRow<TTable, TIgnore> | undefined> {
    const useSoftDelete = softDelete ?? this.#config.softDelete?.enabled
    const where = mergeAnd(
      this.#idWhere(id),
      this.scope(undefined, !useSoftDelete)
    )
    if (useSoftDelete) {
      const [row] = await this.#db
        .update(this.table)
        .set(this.deleteValues() as PgUpdateSetSource<TTable>)
        .where(where)
        .returning(this.#config.selectColumns)
      AssertUtils.notNull(
        row,
        new AppError({ message: `删除 ${this.#config?.tableName} 失败` })
      )
      return row as CrudRow<TTable, TIgnore>
    }
    const [row] = await this.#db
      .delete(this.table)
      .where(where)
      .returning(this.#config.selectColumns)
    AssertUtils.notNull(
      row,
      new AppError({ message: `删除 ${this.#config?.tableName} 失败` })
    )
    return row as CrudRow<TTable, TIgnore>
  }

  /**
   * 批量删除指定主键对应的记录。根据参数或仓储配置执行软删除或物理删除；空数组会直接返回。
   *
   * @param ids - 需要删除的记录主键列表
   * @param softDelete - 是否使用软删除
   * @returns 删除前或软删除后的记录列表
   */
  async deleteMany(
    ids: CrudId[],
    softDelete?: boolean
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    if (!ids.length) return []
    const useSoftDelete = softDelete ?? this.#config.softDelete?.enabled
    const where = mergeAnd(
      inArray(this.#config.key.column, ids),
      this.scope(undefined, !useSoftDelete)
    )
    if (useSoftDelete) {
      return (await this.#db
        .update(this.table)
        .set(this.deleteValues() as PgUpdateSetSource<TTable>)
        .where(where)
        .returning(this.#config.selectColumns)) as CrudRow<TTable, TIgnore>[]
    }
    const rows = await this.#db
      .delete(this.table)
      .where(where)
      .returning(this.#config.selectColumns)
    return rows as CrudRow<TTable, TIgnore>[]
  }

  /**
   * 在事务中锁定并删除单条记录。先使用行级锁读取目标记录，再执行软删除或物理删除，避免并发操作期间记录状态发生变化。
   *
   * @param id - 记录主键
   * @param softDelete - 是否使用软删除
   * @returns 删除前或软删除后的记录；记录不存在或不在可见范围内时返回 undefined
   */
  async safeDelete(
    id: CrudId,
    softDelete?: boolean
  ): Promise<CrudRow<TTable, TIgnore> | undefined> {
    const useSoftDelete = softDelete ?? this.#config.softDelete?.enabled
    return this.#db.transaction(async (tx) => {
      const where = mergeAnd(
        this.#idWhere(id),
        this.scope(undefined, !useSoftDelete)
      )
      const [row] = await tx
        .select(this.#config.selectColumns)
        .from(this.table)
        .where(where)
        .for('update')
      if (!row) return
      if (useSoftDelete) {
        const [updateRow] = await tx
          .update(this.table)
          .set(this.deleteValues() as PgUpdateSetSource<TTable>)
          .where(where)
          .returning(this.#config.selectColumns)
        return updateRow as CrudRow<TTable, TIgnore> | undefined
      }
      const [deleteRow] = await tx
        .delete(this.table)
        .where(where)
        .returning(this.#config.selectColumns)
      return deleteRow as CrudRow<TTable, TIgnore> | undefined
    })
  }

  /**
   * 在事务中锁定并批量删除记录。先锁定匹配的记录，再统一执行软删除或物理删除。
   *
   * @param ids - 需要删除的记录主键列表
   * @param softDelete - 是否使用软删除
   * @returns 删除前或软删除后的记录列表
   */
  async safeDeleteMany(
    ids: CrudId[],
    softDelete?: boolean
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    if (!ids.length) return []
    const useSoftDelete = softDelete ?? this.#config.softDelete?.enabled
    return this.#db.transaction(async (tx) => {
      const where = mergeAnd(
        inArray(this.#config.key.column, ids),
        this.scope(undefined, !useSoftDelete)
      )
      const rows = await tx
        .select(this.#config.selectColumns)
        .from(this.table)
        .where(where)
        .for('update')
      if (!rows.length) return []
      if (useSoftDelete) {
        const updatedRows = await tx
          .update(this.table)
          .set(this.deleteValues() as PgUpdateSetSource<TTable>)
          .where(where)
          .returning(this.#config.selectColumns)
        return updatedRows as CrudRow<TTable, TIgnore>[]
      }
      const deletedRows = (await tx
        .delete(this.table)
        .where(where)
        .returning(this.#config.selectColumns)) as CrudRow<TTable, TIgnore>[]
      return deletedRows
    })
  }
}
