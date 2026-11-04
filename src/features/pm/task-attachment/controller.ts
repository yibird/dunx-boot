import { CrudController } from '@/infra/crud'
import { pmTaskAttachmentSchema } from '@/schemas'
import {
  pmTaskAttachmentCreateReqSchema,
  pmTaskAttachmentQuerySchema,
  pmTaskAttachmentUpdateReqSchema,
} from './model'
import { PmTaskAttachmentService } from './service'

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
