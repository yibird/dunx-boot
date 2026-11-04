import { CrudController } from '@/infra/crud'
import { pmTaskLabelSchema } from '@/schemas'
import {
  pmTaskLabelCreateReqSchema,
  pmTaskLabelQuerySchema,
  pmTaskLabelUpdateReqSchema,
} from './model'
import { PmTaskLabelService } from './service'

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
