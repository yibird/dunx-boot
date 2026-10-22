import { CRUD_ENDPOINT, CrudController } from '@/infra/crud'
import { pmTaskActivitySchema } from '@/schemas'
import {
  pmTaskActivityCreateReqSchema,
  pmTaskActivityQuerySchema,
  pmTaskActivityUpdateReqSchema,
} from './model'
import { PmTaskActivityService } from './service'

/**
 * 任务动态控制器：动态是审计性数据，这里只开放读端点，
 * 写入交给具体业务动作（与操作日志同一策略）。
 */
export class PmTaskActivityController extends CrudController({
  service: PmTaskActivityService,
  prefix: 'pm/task-activity',
  tags: ['任务动态'],
  modelName: 'PmTaskActivity',
  schema: {
    response: pmTaskActivitySchema,
    create: pmTaskActivityCreateReqSchema,
    update: pmTaskActivityUpdateReqSchema,
    query: pmTaskActivityQuerySchema,
  },
  includes: [CRUD_ENDPOINT.GET_PAGE_LIST, CRUD_ENDPOINT.GET_RECORD],
}) {}
