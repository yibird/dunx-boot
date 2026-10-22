import { CrudController } from '@/infra/crud'
import { pmTaskLabelRelSchema } from '@/schemas'
import {
  pmTaskLabelRelCreateReqSchema,
  pmTaskLabelRelQuerySchema,
  pmTaskLabelRelUpdateReqSchema,
} from './model'
import { PmTaskLabelRelService } from './service'

/**
 * 任务标签关联控制器：九个 CRUD 端点由基类生成
 */
export class PmTaskLabelRelController extends CrudController({
  service: PmTaskLabelRelService,
  prefix: 'pm/task-label-rel',
  tags: ['任务标签'],
  modelName: 'PmTaskLabelRel',
  schema: {
    response: pmTaskLabelRelSchema,
    create: pmTaskLabelRelCreateReqSchema,
    update: pmTaskLabelRelUpdateReqSchema,
    query: pmTaskLabelRelQuerySchema,
  },
}) {}
