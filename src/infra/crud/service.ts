import { Api, Pager, type BaseQuery } from '../model'
import { CrudRepository } from './repository'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { CrudInsert, CrudRow, CrudSelect } from './repository/types'
import type { ApiPayload, CrudId } from './types'

/**
 * 通用 CRUD 业务层，基于 {@link CrudRepository}
 */
export class CrudService<
  TTable extends PgTable,
  TRepo extends CrudRepository<TTable> = CrudRepository<TTable>,
  TIgnore extends keyof CrudSelect<TTable> = TRepo extends CrudRepository<
    TTable,
    infer TI
  >
    ? TI
    : never,
> {
  constructor(protected readonly repository: TRepo) {}

  /**
   * 获取分页列表
   *
   * @param query 分页参数
   * @param options 查询可选行为
   * @returns 分页列表
   */
  async getPageList<TQuery extends Partial<BaseQuery>>(
    query: TQuery
  ): Promise<ApiPayload<Pager<CrudRow<TTable, TIgnore>>>> {
    const { current, pageSize } = Pager.getPagination(query)
    const [list, total] = await Promise.all([
      this.repository.findPage(query),
      this.repository.count(query),
    ])
    return Api.ok(Pager.of(list, total, { current, pageSize }))
  }

  /**
   * 获取列表
   *
   * @param query 查询参数
   * @returns 列表
   */
  async getList<TQuery extends Partial<BaseQuery>>(query: TQuery) {
    const rows = await this.repository.findMany(query)
    return Api.ok(rows)
  }

  /**
   * 根据id获取记录
   *
   * @param id 记录id
   * @returns 记录
   */
  async getRecord(id: CrudId) {
    const row = await this.repository.findById(id)
    return Api.ok(row)
  }

  /**
   * 新增记录
   *
   * @param input 新增数据
   * @returns 新增记录
   */
  async create(input: Partial<CrudInsert<TTable>>) {
    const row = await this.repository.create(input)
    return Api.ok(row)
  }

  /**
   * 更新记录
   *
   * @param id 记录id
   * @param input 更新数据
   * @returns 更新记录
   */
  async update(id: CrudId, input: Partial<CrudInsert<TTable>>) {
    const row = await this.repository.update(id, input)
    return Api.ok(row)
  }

  /**
   * 删除记录
   *
   * @param id 记录id
   * @param softDelete 是否软删除
   * @returns 删除记录
   */
  async delete(id: CrudId, softDelete?: boolean) {
    const row = await this.repository.delete(id, softDelete)
    return Api.ok(row)
  }

  /**
   * 批量新增
   *
   * @param inputs 新增数据列表
   * @returns 新增记录列表
   */
  async createMany(inputs: Partial<CrudInsert<TTable>>[]) {
    const rows = await this.repository.createMany(inputs)
    return Api.ok(rows)
  }

  /**
   * 批量更新
   *
   * @param ids 记录id列表
   * @param input 更新数据
   * @returns 更新记录列表
   */
  async updateMany(ids: CrudId[], input: Partial<CrudInsert<TTable>>) {
    const rows = await this.repository.updateMany(ids, input)
    return Api.ok(rows)
  }

  /**
   * 批量删除
   *
   * @param ids 记录id列表
   * @param softDelete 是否软删除
   * @returns 删除记录列表
   */
  async deleteMany(ids: CrudId[], softDelete?: boolean) {
    const rows = await this.repository.deleteMany(ids, softDelete)
    return Api.ok(rows)
  }

  /**
   * 安全删除记录
   *
   * @param id 记录id
   * @param softDelete 是否软删除
   */
  async safeDelete(id: CrudId, softDelete?: boolean) {
    await this.repository.safeDelete(id, softDelete)
  }

  /**
   * 安全批量删除记录
   *
   * @param ids 记录id列表
   * @param softDelete 是否软删除
   */
  async safeDeleteMany(ids: CrudId[], softDelete?: boolean) {
    await this.repository.safeDeleteMany(ids, softDelete)
  }
}
