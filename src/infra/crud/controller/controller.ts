import { inject, type Ctor } from '@dunx/core'
import { Controller, Get, Post, type Input } from '@dunx/http'
import { ApiDoc } from '@dunx/openapi'
import { Permission } from '@/infra/http'
import { z } from 'zod'
import { CRUD_ENDPOINT } from './constant'
import { apiRouteResponse } from '@/infra/model'
import { ApiStatus } from '@/constants'
import { getExcludes, getPermission, getTags } from './util'
import type { CrudControllerOptions, CrudControllerService } from './types'

/**
 * 生成基类继承的最小基类：只做一件事——持有该域的业务服务
 */
export abstract class AbstractCrudController<
  TService extends CrudControllerService = CrudControllerService,
> {
  protected readonly service!: TService
}

/**
 * 生成一个可继承的 CRUD 控制器基类
 */
export function CrudController<
  TService extends CrudControllerService,
  TQuery extends z.ZodObject,
>(
  options: CrudControllerOptions<TService, TQuery>
): Ctor<AbstractCrudController<TService>> {
  const { prefix } = options
  const tags = getTags(options)
  const { response, query, create, update } = options.schema

  const schemas = {
    getList: {
      response: apiRouteResponse(response),
      query: query.omit({
        current: true,
        pageSize: true,
      }),
    },
    getPageList: {
      response: apiRouteResponse(response),
      query,
    },
    getRecord: {
      response: apiRouteResponse(response.optional()),
      query: z.object({ id: z.string() }),
    },
    create: {
      status: ApiStatus.OK,
      body: create,
      response: apiRouteResponse(),
    },
    createMany: {
      status: ApiStatus.OK,
      body: z.array(create),
      response: apiRouteResponse(),
    },
    update: {
      status: ApiStatus.OK,
      body: update.extend({
        id: z.string().meta({ description: '主键 ID' }),
      }),
      response: apiRouteResponse(),
    },
    updateMany: {
      status: ApiStatus.OK,
      body: z.object({ data: update, ids: z.array(z.string()) }),
      response: apiRouteResponse(),
    },
    deleteById: {
      status: ApiStatus.OK,
      body: z.object({ id: z.string() }),
      response: apiRouteResponse(),
    },
    deleteMany: {
      status: ApiStatus.OK,
      body: z.array(z.string()),
      response: apiRouteResponse(),
    },
  } as const

  @ApiDoc({ tags })
  @Controller(prefix, { excludes: getExcludes(options) })
  class GeneratedCrudController extends AbstractCrudController<TService> {
    protected override readonly service = inject(options.service)

    @Permission(getPermission(CRUD_ENDPOINT.GET_LIST, options))
    @ApiDoc({ summary: '获取列表' })
    @Get(CRUD_ENDPOINT.GET_LIST, schemas.getList)
    async getList(input: Input<typeof schemas.getList>) {
      const res = await this.service.getList(input.query)
      return Response.json(res, { status: ApiStatus.OK })
    }

    @Permission(getPermission(CRUD_ENDPOINT.GET_PAGE_LIST, options))
    @ApiDoc({ summary: '获取分页列表' })
    @Get(CRUD_ENDPOINT.GET_PAGE_LIST, schemas.getPageList)
    async getPageList(input: Input<typeof schemas.getPageList>) {
      const result = await this.service.getPageList(input.query)
      return Response.json(result, { status: ApiStatus.OK })
    }

    @Permission(getPermission(CRUD_ENDPOINT.GET_RECORD, options))
    @ApiDoc({ summary: '获取记录' })
    @Get(CRUD_ENDPOINT.GET_RECORD, schemas.getRecord)
    async getRecord(input: Input<typeof schemas.getRecord>) {
      const res = await this.service.getRecord(input.query.id)
      return Response.json(res, { status: ApiStatus.OK })
    }

    @Permission(getPermission(CRUD_ENDPOINT.CREATE, options))
    @ApiDoc({ summary: '新增' })
    @Post(CRUD_ENDPOINT.CREATE, schemas.create)
    async create({ body }: Input<typeof schemas.create>) {
      const res = await this.service.create(body)
      return Response.json(res, { status: ApiStatus.OK })
    }

    @Permission(getPermission(CRUD_ENDPOINT.CREATE_MANY, options))
    @ApiDoc({ summary: '批量新增' })
    @Post(CRUD_ENDPOINT.CREATE_MANY, schemas.createMany)
    async createMany({ body }: Input<typeof schemas.createMany>) {
      const res = await this.service.createMany(body)
      return Response.json(res, { status: ApiStatus.OK })
    }

    @Permission(getPermission(CRUD_ENDPOINT.UPDATE, options))
    @ApiDoc({ summary: '更新' })
    @Post(CRUD_ENDPOINT.UPDATE, schemas.update)
    async update({ body }: Input<typeof schemas.update>) {
      const res = await this.service.update((body as { id: string }).id, body)
      return Response.json(res, { status: ApiStatus.OK })
    }

    @Permission(getPermission(CRUD_ENDPOINT.UPDATE_MANY, options))
    @ApiDoc({ summary: '批量更新' })
    @Post(CRUD_ENDPOINT.UPDATE_MANY, schemas.updateMany)
    async updateMany({ body }: Input<typeof schemas.updateMany>) {
      const res = await this.service.updateMany(body.ids, body.data)
      return Response.json(res, { status: ApiStatus.OK })
    }

    @Permission(getPermission(CRUD_ENDPOINT.DELETE, options))
    @ApiDoc({ summary: '删除' })
    @Post(CRUD_ENDPOINT.DELETE, schemas.deleteById)
    async delete(input: Input<typeof schemas.deleteById>) {
      const result = await this.service.delete(input.body.id)
      return Response.json(result, { status: ApiStatus.OK })
    }

    @Permission(getPermission(CRUD_ENDPOINT.DELETE_MANY, options))
    @ApiDoc({ summary: '批量删除' })
    @Post(CRUD_ENDPOINT.DELETE_MANY, schemas.deleteMany)
    async deleteMany({ body }: Input<typeof schemas.deleteMany>) {
      const res = await this.service.deleteMany(body)
      return Response.json(res, { status: ApiStatus.OK })
    }
  }

  return GeneratedCrudController
}
