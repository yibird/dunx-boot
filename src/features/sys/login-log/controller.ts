import { Controller, Get, type Input } from '@dunx/http'
import { ApiDoc } from '@dunx/openapi'
import { Api, apiRouteResponse } from '@/infra/model'
import { sysLoginLogSchema, sysLoginLogQuerySchema } from './schema'
import { SysLoginLogService } from './service'

const routes = {
  getPageList: {
    query: sysLoginLogQuerySchema,
    response: apiRouteResponse(sysLoginLogSchema),
  },
}

@Controller('/sys/login-log')
@ApiDoc({ tags: ['登录日志'] })
export class SysLoginLogController {
  constructor(readonly service: SysLoginLogService) {}

  @Get('/getPageList', routes.getPageList)
  @ApiDoc({ summary: '获取分页列表' })
  async getPageList({ query }: Input<typeof routes.getPageList>) {
    const res = this.service.getPageList(query)
    return Response.json(Api.ok(res))
  }
}
