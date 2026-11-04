import { CrudController } from '@/infra/crud'
import { pmTaskCommentSchema } from '@/schemas'
import {
  pmTaskCommentCreateReqSchema,
  pmTaskCommentQuerySchema,
  pmTaskCommentUpdateReqSchema,
} from './model'
import { PmTaskCommentService } from './service'

export class PmTaskCommentController extends CrudController({
  service: PmTaskCommentService,
  prefix: 'pm/task-comment',
  tags: ['任务评论'],
  modelName: 'PmTaskComment',
  schema: {
    response: pmTaskCommentSchema,
    create: pmTaskCommentCreateReqSchema,
    update: pmTaskCommentUpdateReqSchema,
    query: pmTaskCommentQuerySchema,
  },
}) {}
