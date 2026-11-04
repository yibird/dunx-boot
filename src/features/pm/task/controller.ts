import { CrudController } from '@/infra/crud'
import { pmTaskSchema } from '@/schemas'
import {
  pmTaskCreateReqSchema,
  pmTaskQuerySchema,
  pmTaskUpdateReqSchema,
} from './model'
import { PmTaskService } from './service'

export class PmTaskController extends CrudController({
  service: PmTaskService,
  prefix: 'pm/task',
  tags: ['任务'],
  modelName: 'PmTask',
  schema: {
    response: pmTaskSchema,
    create: pmTaskCreateReqSchema,
    update: pmTaskUpdateReqSchema,
    query: pmTaskQuerySchema,
  },
}) {}
