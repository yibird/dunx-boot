import { Post, type Input } from '@dunx/http'
import { ApiDoc } from '@dunx/openapi'
import { CrudController } from '@/infra/crud'
import { apiRouteResponse, IdSchema } from '@/infra/model'
import { ApiStatus } from '@/constants'
import {
  sysMessageSchema,
  SysMessageCreateReq,
  SysMessageQuery,
  SysMessageUpdateReq,
} from './schema'
import { SysMessageService } from './service'

const routes = {
  read: {
    status: ApiStatus.OK,
    body: IdSchema,
    response: apiRouteResponse(),
  },
} as const

export class SysMessageController extends CrudController({
  service: SysMessageService,
  prefix: 'sys/message',
  tags: ['系统消息'],
  modelName: 'SysMessage',
  schema: {
    response: sysMessageSchema,
    create: SysMessageCreateReq,
    update: SysMessageUpdateReq,
    query: SysMessageQuery,
  },
}) {
  @ApiDoc({ summary: '标记消息已读' })
  @Post('/markAsRead', routes.read)
  async markAsRead({ body }: Input<typeof routes.read>) {
    const res = await this.service.markAsRead(body.id)
    return Response.json(res, { status: ApiStatus.OK })
  }

  @ApiDoc({ summary: '标记所有消息已读' })
  @Post('/markAllAsRead', routes.read)
  async markAllAsRead() {
    const res = await this.service.markAllAsRead()
    return Response.json(res, { status: ApiStatus.OK })
  }
}
