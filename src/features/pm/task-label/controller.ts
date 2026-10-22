import { CrudController } from '@/infra/crud'
import { pmTaskLabelSchema } from '@/schemas'
import {
  pmTaskLabelCreateReqSchema,
  pmTaskLabelQuerySchema,
  pmTaskLabelUpdateReqSchema,
} from './model'
import { PmTaskLabelService } from './service'

/**
 * 任务标签控制器：九个 CRUD 端点由基类生成
 */
export class PmTaskLabelController extends CrudController({
  service: PmTaskLabelService,
  prefix: 'pm/task-label',
  tags: ['任务标签'],
  modelName: 'PmTaskLabel',
  schema: {
    response: pmTaskLabelSchema,
    create: pmTaskLabelCreateReqSchema,
    update: pmTaskLabelUpdateReqSchema,
    query: pmTaskLabelQuerySchema,
  },
}) {}
