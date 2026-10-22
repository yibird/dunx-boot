import { Controller, Get, Post, type Input } from '@dunx/http'
import { ApiDoc } from '@dunx/openapi'
import { z } from 'zod'
import { ApiStatus } from '@/constants'
import { Permission } from '@/infra/http'
import { apiOkSchema, apiRouteResponse, pageSchema } from '@/infra/model'
import { AiAgentService } from './service'
import {
  aiAgentCreateReqSchema,
  aiAgentQuerySchema,
  aiAgentRecordSchema,
  aiAgentResponseSchema,
  aiAgentUpdateBodySchema,
} from './schema'

const routes = {
  getRecord: {
    query: aiAgentRecordSchema,
    response: apiRouteResponse(aiAgentResponseSchema),
  },
  getList: {
    query: aiAgentQuerySchema,
    response: apiRouteResponse(z.array(aiAgentResponseSchema)),
  },
  getPageList: {
    query: aiAgentQuerySchema,
    response: { [ApiStatus.OK]: pageSchema(aiAgentResponseSchema) },
  },
  create: {
    body: aiAgentCreateReqSchema,
    response: { [ApiStatus.CREATED]: apiOkSchema(aiAgentResponseSchema) },
  },
  update: {
    body: aiAgentUpdateBodySchema,
    status: ApiStatus.OK,
    response: apiRouteResponse(aiAgentResponseSchema),
  },
  delete: {
    body: aiAgentRecordSchema,
    status: ApiStatus.OK,
    response: apiRouteResponse(aiAgentResponseSchema),
  },
} as const

@ApiDoc({ tags: ['Agent'] })
@Controller('ai/agent')
export class AiAgentController {
  constructor(private readonly service: AiAgentService) {}

  @ApiDoc({ summary: 'Agent 详情及技能 ID' })
  @Permission('ai:agent:getRecord')
  @Get('getRecord', routes.getRecord)
  getRecord({ query }: Input<typeof routes.getRecord>) {
    return this.service.getRecord(query.id)
  }

  @ApiDoc({ summary: '当前用户的 Agent 列表' })
  @Permission('ai:agent:getList')
  @Get('getList', routes.getList)
  getList({ query }: Input<typeof routes.getList>) {
    return this.service.getList(query)
  }

  @ApiDoc({ summary: '当前用户的 Agent 分页列表' })
  @Permission('ai:agent:getPageList')
  @Get('getPageList', routes.getPageList)
  getPageList({ query }: Input<typeof routes.getPageList>) {
    return this.service.getPageList(query)
  }

  @ApiDoc({ summary: '创建 Agent 并绑定技能' })
  @Permission('ai:agent:create')
  @Post('create', routes.create)
  create({ body }: Input<typeof routes.create>) {
    return this.service.create(body)
  }

  @ApiDoc({ summary: '更新 Agent，skillIds 省略保留、空数组清空' })
  @Permission('ai:agent:update')
  @Post('update', routes.update)
  update({ body }: Input<typeof routes.update>) {
    const { id, ...data } = body
    return this.service.update(id, data)
  }

  @ApiDoc({ summary: '删除 Agent 及其技能关联' })
  @Permission('ai:agent:delete')
  @Post('delete', routes.delete)
  delete({ body }: Input<typeof routes.delete>) {
    return this.service.delete(body.id)
  }
}
