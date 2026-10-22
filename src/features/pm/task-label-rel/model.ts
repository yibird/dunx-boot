import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { pmTaskLabelRelSchema } from '@/schemas'

/**
 * 任务标签关联查询Schema
 */
export const pmTaskLabelRelQuerySchema = baseQuerySchema
  .extend({
    taskId: z.string().optional().meta({ description: '任务主键' }),
    labelId: z.string().optional().meta({ description: '标签主键' }),
  })
  .meta({ id: 'PmTaskLabelRelQuery' })

/**
 * 任务标签关联新增Schema
 */
export const pmTaskLabelRelCreateReqSchema = pmTaskLabelRelSchema
  .pick({
    taskId: true,
    labelId: true,
  })
  .meta({ id: 'PmTaskLabelRelCreateReq' })

/**
 * 任务标签关联更新Schema
 */
export const pmTaskLabelRelUpdateReqSchema = pmTaskLabelRelCreateReqSchema
  .extend({
    id: pmTaskLabelRelSchema.shape.id,
  })
  .meta({ id: 'PmTaskLabelRelUpdateReq' })

export type PmTaskLabelRelQuery = z.infer<typeof pmTaskLabelRelQuerySchema>
export type PmTaskLabelRelCreateReq = z.infer<
  typeof pmTaskLabelRelCreateReqSchema
>
export type PmTaskLabelRelUpdateReq = z.infer<
  typeof pmTaskLabelRelUpdateReqSchema
>
