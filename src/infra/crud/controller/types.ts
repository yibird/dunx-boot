import type { AbstractCtor, Ctor } from '@dunx/core'
import type { ZodObject } from 'zod'
import type { ApiPayload, CrudId } from '../types'
import type { BaseQuery } from '@/infra/model'
import type { AbstractCrudController } from './controller'
import type { CrudEndpoint } from './constant'

/**
 * 控制器层的类型：服务契约、路由描述、生成器的配置。
 *
 * 生成基类的工厂（`CrudController`）与它继承的最小基类
 * （{@link AbstractCrudController}）都在 `controller.ts`，可挂的九条路由在
 * `routes.ts`。
 */

/**
 * CrudController 依赖的服务契约。
 *
 * `CrudService` 天然满足；自定义服务只要实现这几个方法也能接入。
 * 入参用 `unknown`：控制器是运行时工厂，schema 的具体类型在业务侧，
 * 契约只约束"能接收任何入参并返回统一响应体"。上下文不在契约里——
 * 由服务自己解析。
 */
export interface CrudControllerService {
  getPageList(query: Partial<BaseQuery>): Promise<ApiPayload<unknown>>
  getList(query: Partial<BaseQuery>): Promise<ApiPayload<unknown>>
  getRecord(id: CrudId): Promise<ApiPayload<unknown>>
  create(input: unknown): Promise<ApiPayload<unknown>>
  createMany(inputs: readonly unknown[]): Promise<ApiPayload<unknown>>
  update(id: CrudId, input: unknown): Promise<ApiPayload<unknown>>
  updateMany(ids: CrudId[], input: unknown): Promise<ApiPayload<unknown>>
  delete(id: CrudId): Promise<ApiPayload<unknown>>
  deleteMany(ids: readonly CrudId[]): Promise<ApiPayload<unknown>>
}

/**
 * 一个 CRUD 域需要的 schema 组。
 *
 * 分组成一个对象是为了让调用点只写一次 `schema: {...}`，并且让
 * {@link crudRoutes} / {@link CrudController} 共用同一套词汇。
 */
export interface CrudSchema<
  TResponse extends ZodObject = ZodObject,
  TCreate extends ZodObject = ZodObject,
  TUpdate extends ZodObject = ZodObject,
  TQuery extends ZodObject = ZodObject,
> {
  /**
   * 响应实体 schema（行对象；同时作为 `components/schemas/<modelName>Resp`）
   */
  readonly response: TResponse
  /**
   * 新增入参 schema（对象；body）
   */
  readonly create: TCreate
  /**
   * 更新入参 schema
   */
  readonly update: TUpdate
  /**
   * 分页查询 schema（输出需包含 `current`/`pageSize`）
   */
  readonly query: TQuery
}

export interface CrudRoutesOptions<
  TResponse extends ZodObject = ZodObject,
  TCreate extends ZodObject = ZodObject,
  TUpdate extends ZodObject = ZodObject,
  TQuery extends ZodObject = ZodObject,
> {
  /**
   * 该域的 schema 组
   */
  readonly schema: CrudSchema<TResponse, TCreate, TUpdate, TQuery>
  /**
   * OpenAPI 组件名前缀，如 `SysPost` → `SysPostResp` / `SysPostPage`；默认 `Crud`
   */
  readonly modelName?: string
}

/**
 * 生成的控制器类构造器：{@link CrudController} 返回的就是它，域里 `extends` 它。
 *
 * 类型上回指 `controller.ts`：子类要能看见 `protected service`，而接口写不出
 * protected 成员，所以这条类型依赖落在类本身上。`import type` 在运行期被擦掉，
 * 两个模块之间没有真的循环。
 */
export type CrudControllerCtor<TService extends CrudControllerService> = Ctor<
  AbstractCrudController<TService>
>

export interface CrudControllerOptions<
  TService extends CrudControllerService = CrudControllerService,
  TQuery extends ZodObject = ZodObject,
> {
  /**
   * @desc 业务服务类。容器解析（可正常 DI），需满足 {@link CrudControllerService}
   * @default
   */
  readonly service: AbstractCtor<TService>
  /**
   * @desc 路由前缀，如 `sys/post`
   * @default
   */
  readonly prefix: string
  /**
   * @desc 权限分隔符，如 `:`。权限前缀由 `modelName` 派生
   * （`SysPost` → `sys:post`），词间也用这个分隔符连接
   * @default ':'
   */
  readonly permissionSeparator?: string
  /**
   * 该域的 schema 组：响应实体 + 新增/更新/分页查询入参。
   *
   * `query` 应包含分页字段；生成器会从 `getList` 的查询中移除分页字段，
   * 分页列表则继续使用完整查询。
   */
  readonly schema: CrudSchema<ZodObject, ZodObject, ZodObject, TQuery>
  /**
   * @desc OpenAPI 标签
   * @default []
   */
  readonly tags?: string[]
  /**
   * @desc 组件名前缀
   * @default
   */
  readonly modelName: string
  /**
   * @desc 只生成这些端点；缺省九个全生成。取值见 {@link CrudEndpoint}
   */
  readonly includes?: readonly CrudEndpoint[]
  /**
   * @desc 不生成这些端点；它减在 `includes` 选出的集合上（缺省是全量）
   * @default []
   */
  readonly excludes?: readonly CrudEndpoint[]
}
