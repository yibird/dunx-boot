import { CRUD_ENDPOINT, CrudController } from '@/infra/crud'
import { pmTaskActivitySchema } from '@/schemas'
import {
  pmTaskActivityCreateReqSchema,
  pmTaskActivityQuerySchema,
  pmTaskActivityUpdateReqSchema,
} from './model'
import { PmTaskActivityService } from './service'

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
