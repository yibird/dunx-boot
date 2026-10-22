import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { pmTaskAttachmentSchema } from '@/schemas'

/**
 * 任务附件查询Schema
 */
export const pmTaskAttachmentQuerySchema = baseQuerySchema
  .extend({
    taskId: z.string().optional().meta({ description: '任务主键' }),
    fileId: z.string().optional().meta({ description: '文件主键' }),
  })
  .meta({ id: 'PmTaskAttachmentQuery' })

/**
 * 任务附件新增Schema
 */
export const pmTaskAttachmentCreateReqSchema = pmTaskAttachmentSchema
  .pick({
    taskId: true,
    fileId: true,
    fileName: true,
  })
  .partial({
    fileName: true,
  })
  .meta({ id: 'PmTaskAttachmentCreateReq' })

/**
 * 任务附件更新Schema
 */
export const pmTaskAttachmentUpdateReqSchema = pmTaskAttachmentCreateReqSchema
  .extend({
    id: pmTaskAttachmentSchema.shape.id,
  })
  .meta({ id: 'PmTaskAttachmentUpdateReq' })

export type PmTaskAttachmentQuery = z.infer<typeof pmTaskAttachmentQuerySchema>
export type PmTaskAttachmentCreateReq = z.infer<
  typeof pmTaskAttachmentCreateReqSchema
>
export type PmTaskAttachmentUpdateReq = z.infer<
  typeof pmTaskAttachmentUpdateReqSchema
>
