import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { pmTaskCommentSchema } from '@/schemas'

/**
 * 任务评论查询Schema
 */
export const pmTaskCommentQuerySchema = baseQuerySchema
  .extend({
    taskId: z.string().optional().meta({ description: '任务主键' }),
    userId: z.string().optional().meta({ description: '评论人主键' }),
    parentId: z
      .string()
      .optional()
      .meta({ description: '被回复的评论主键；为空表示顶层评论' }),
  })
  .meta({ id: 'PmTaskCommentQuery' })

/**
 * 任务评论新增Schema
 */
export const pmTaskCommentCreateReqSchema = pmTaskCommentSchema
  .pick({
    taskId: true,
    userId: true,
    parentId: true,
    content: true,
  })
  .partial({
    parentId: true,
  })
  .meta({ id: 'PmTaskCommentCreateReq' })

/**
 * 任务评论更新Schema
 */
export const pmTaskCommentUpdateReqSchema = pmTaskCommentCreateReqSchema
  .extend({
    id: pmTaskCommentSchema.shape.id,
  })
  .meta({ id: 'PmTaskCommentUpdateReq' })

export type PmTaskCommentQuery = z.infer<typeof pmTaskCommentQuerySchema>
export type PmTaskCommentCreateReq = z.infer<
  typeof pmTaskCommentCreateReqSchema
>
export type PmTaskCommentUpdateReq = z.infer<
  typeof pmTaskCommentUpdateReqSchema
>
