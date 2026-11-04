import { Pager, type BaseQuery } from '@/infra/model'
import type { PgTable } from 'drizzle-orm/pg-core'
import type {
  CrudCreate,
  CrudRepository,
  CrudRow,
  CrudUpdate,
  QueryOptions,
} from '../repository'

/**
 * 通用 CRUD 业务层（crud2）
 *
 * 只返回业务数据，统一响应体由控制器包装。业务查询条件通过
 * {@link getQueryOptions} 映射，仓储再把它与默认条件、插件条件合并。
 */
export class CrudService<
  TTable extends PgTable,
  TIgnore extends keyof TTable['_']['columns'] = never,
  TRepo extends CrudRepository<TTable, TIgnore> = CrudRepository<
    TTable,
    TIgnore
  >,
  TQuery extends Partial<BaseQuery> = Partial<BaseQuery>,
> {
  constructor(protected readonly repository: TRepo) {}

  /**
   * 分页列表
   */
  async getPageList(query: TQuery = {} as TQuery, options?: QueryOptions) {
    const pagination = Pager.getPagination(query)
    const [list, total] = await Promise.all([
      this.repository.getPageList(query, options),
      this.repository.count(options),
    ])
    return Pager.of(list, total, pagination)
  }

  /**
   * 列表（不分页）
   */
  async getList(options?: QueryOptions) {
    return this.repository.getMany(options)
  }

  /**
   * 详情
   */
  async getRecord(id: string) {
    return this.repository.findById(id)
  }

  /**
   * 新增
   */
  async create(input: CrudCreate<TTable>): Promise<CrudRow<TTable, TIgnore>> {
    return this.repository.create(input)
  }

  /**
   * 批量新增
   */
  async createMany(
    inputs: CrudCreate<TTable>[]
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    return this.repository.createMany(inputs)
  }

  /**
   * 更新
   */
  async update(
    id: string,
    input: CrudUpdate<TTable>
  ): Promise<CrudRow<TTable, TIgnore>> {
    return this.repository.update(id, input)
  }

  /**
   * 批量更新
   */
  async updateMany(
    ids: string[],
    input: CrudUpdate<TTable>
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    return this.repository.updateMany(ids, input)
  }

  /**
   * 删除
   */
  async delete(
    id: string,
    softDelete?: boolean
  ): Promise<CrudRow<TTable, TIgnore>> {
    return this.repository.delete(id, softDelete)
  }

  /**
   * 批量删除
   */
  async deleteMany(
    ids: string[],
    softDelete?: boolean
  ): Promise<CrudRow<TTable, TIgnore>[]> {
    return this.repository.deleteMany(ids, softDelete)
  }
}
