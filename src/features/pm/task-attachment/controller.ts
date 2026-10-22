import { CrudController } from '@/infra/crud'
import { pmTaskAttachmentSchema } from '@/schemas'
import {
  pmTaskAttachmentCreateReqSchema,
  pmTaskAttachmentQuerySchema,
  pmTaskAttachmentUpdateReqSchema,
} from './model'
import { PmTaskAttachmentService } from './service'

/**
 * 任务附件控制器：九个 CRUD 端点由基类生成
 */
export class PmTaskAttachmentController extends CrudController({
  service: PmTaskAttachmentService,
  prefix: 'pm/task-attachment',
  tags: ['任务附件'],
  modelName: 'PmTaskAttachment',
  schema: {
    response: pmTaskAttachmentSchema,
    create: pmTaskAttachmentCreateReqSchema,
    update: pmTaskAttachmentUpdateReqSchema,
    query: pmTaskAttachmentQuerySchema,
  },
}) {}
