import { Controller, Get, type Input } from '@dunx/http'
import { ApiDoc } from '@dunx/openapi'
import { Api, apiRouteResponse } from '@/infra/model'
import { SysRequestLogService } from './service'
import { sysRequestLogSchema, sysRequestLogQuerySchema } from './schema'

const routes = {
  getPageList: {
    query: sysRequestLogQuerySchema,
    response: apiRouteResponse(sysRequestLogSchema),
  },
}

@Controller('/sys/request-log')
@ApiDoc({ tags: ['请求日志'] })
export class SysRequestLogController {
  constructor(readonly service: SysRequestLogService) {}

  @Get('/getPageList', routes.getPageList)
  @ApiDoc({ summary: '获取分页列表' })
  async getPageList({ query }: Input<typeof routes.getPageList>) {
    const res = this.service.getPageList(query)
    return Response.json(Api.ok(res))
  }
}
