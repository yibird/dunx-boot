import type { AbstractCtor, Ctor } from '@dunx/core'
import type { ZodObject } from 'zod'
import type { BaseQuery } from '@/infra/model'
import type { QueryOptions } from '../repository'
import type { AbstractCrudController } from './controller'
import type { CrudEndpoint } from './constant'

/**
 * 主键类型
 */
export type CrudId = string

/**
 * CrudController 依赖的服务契约。
 *
 * 服务层只返回业务数据，统一响应体由控制器包装；查询条件由控制器通过
 * `queryOptions` 映射成 {@link QueryOptions} 后传入。
 */
export interface CrudControllerService {
  getPageList(
    query?: Partial<BaseQuery>,
    options?: QueryOptions
  ): Promise<unknown>
  getList(options?: QueryOptions): Promise<unknown>
  getRecord(id: CrudId): Promise<unknown>
  create(input: unknown): Promise<unknown>
  createMany(inputs: readonly unknown[]): Promise<unknown>
  update(id: CrudId, input: unknown): Promise<unknown>
  updateMany(ids: CrudId[], input: unknown): Promise<unknown>
  delete(id: CrudId, softDelete?: boolean): Promise<unknown>
  deleteMany(ids: readonly CrudId[]): Promise<unknown>
}

/**
 * 一个 CRUD 域需要的 schema 组
 */
export interface CrudSchema<
  TResponse extends ZodObject = ZodObject,
  TCreate extends ZodObject = ZodObject,
  TUpdate extends ZodObject = ZodObject,
  TQuery extends ZodObject = ZodObject,
> {
  readonly response: TResponse
  readonly create: TCreate
  readonly update: TUpdate
  readonly query: TQuery
}

/**
 * 生成的控制器类构造器
 */
export type CrudControllerCtor<TService extends CrudControllerService> = Ctor<
  AbstractCrudController<TService>
>

export interface CrudControllerOptions<
  TService extends CrudControllerService = CrudControllerService,
  TQuery extends ZodObject = ZodObject,
> {
  /**
   * 业务服务类，由容器解析
   */
  readonly service: AbstractCtor<TService>
  /**
   * 路由前缀，如 `sys/post`
   */
  readonly prefix: string
  /**
   * 权限分隔符，默认 `:`
   */
  readonly permissionSeparator?: string
  /**
   * 该域的 schema 组
   */
  readonly schema: CrudSchema<ZodObject, ZodObject, ZodObject, TQuery>
  /**
   * OpenAPI 标签
   */
  readonly tags?: string[]
  /**
   * 组件名前缀
   */
  readonly modelName: string
  /**
   * 只生成这些端点
   */
  readonly includes?: readonly CrudEndpoint[]
  /**
   * 不生成这些端点
   */
  readonly excludes?: readonly CrudEndpoint[]
}
