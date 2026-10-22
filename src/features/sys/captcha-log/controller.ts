import { Controller, Get, type Input } from '@dunx/http'
import { ApiDoc } from '@dunx/openapi'
import { Api, apiRouteResponse } from '@/infra/model'
import { sysCaptchaLogSchema } from '@/schemas'
import { SysCaptchaLogService } from './service'
import { sysCaptchaLogQuerySchema } from './model'

const routes = {
  getPageList: {
    query: sysCaptchaLogQuerySchema,
    response: apiRouteResponse(sysCaptchaLogSchema),
  },
}

@Controller('/sys/captcha-log')
@ApiDoc({ tags: ['验证码日志'] })
export class SysCaptchaLogController {
  constructor(readonly service: SysCaptchaLogService) {}

  @Get('/getPageList', routes.getPageList)
  @ApiDoc({ summary: '获取分页列表' })
  async getPageList({ query }: Input<typeof routes.getPageList>) {
    const res = this.service.getPageList(query)
    return Response.json(Api.ok(res))
  }
}
