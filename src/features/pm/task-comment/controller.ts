import { CrudController } from '@/infra/crud'
import { pmTaskCommentSchema } from '@/schemas'
import {
  pmTaskCommentCreateReqSchema,
  pmTaskCommentQuerySchema,
  pmTaskCommentUpdateReqSchema,
} from './model'
import { PmTaskCommentService } from './service'

/**
 * 任务评论控制器：九个 CRUD 端点由基类生成
 */
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
