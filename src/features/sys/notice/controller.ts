import { Post, type Input } from '@dunx/http'
import { ApiDoc } from '@dunx/openapi'
import { CrudController } from '@/infra/crud'
import { apiRouteResponse, IdSchema } from '@/infra/model'
import { ApiStatus } from '@/constants'
import {
  sysNoticeSchema,
  SysNoticeCreateReq,
  SysNoticeQuery,
  SysNoticeUpdateReq,
} from './schema'
import { SysNoticeService } from './service'

/**
 * 自有端点：标记当前用户已读
 */
const routes = {
  read: {
    status: ApiStatus.OK,
    body: IdSchema,
    response: apiRouteResponse(),
  },
} as const

/**
 * 通知公告控制器：九个 CRUD 端点由基类生成，另有自助的「标记已读」
 */
export class SysNoticeController extends CrudController({
  service: SysNoticeService,
  prefix: 'sys/notice',
  tags: ['通知公告'],
  modelName: 'SysNotice',
  schema: {
    response: sysNoticeSchema,
    create: SysNoticeCreateReq,
    update: SysNoticeUpdateReq,
    query: SysNoticeQuery,
  },
}) {
  /**
   * 标记已读是每个登录用户对自己的动作，只要求登录，不挂 @Permission
   */
  @ApiDoc({ summary: '标记通知已读' })
  @Post('/read', routes.read)
  async read({ body }: Input<typeof routes.read>) {
    const res = await this.service.read(body.id)
    return Response.json(res, { status: ApiStatus.OK })
  }
}
