import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { pmTaskLabelSchema } from '@/schemas'

/**
 * 任务标签查询Schema
 */
export const pmTaskLabelQuerySchema = baseQuerySchema
  .extend({
    projectId: z.string().optional().meta({ description: '所属项目主键' }),
    labelName: z
      .string()
      .optional()
      .meta({ description: '标签名称（模糊查询）' }),
  })
  .meta({ id: 'PmTaskLabelQuery' })

/**
 * 任务标签新增Schema
 */
export const pmTaskLabelCreateReqSchema = pmTaskLabelSchema
  .pick({
    projectId: true,
    labelName: true,
    color: true,
    sort: true,
  })
  .partial({
    color: true,
    sort: true,
  })
  .meta({ id: 'PmTaskLabelCreateReq' })

/**
 * 任务标签更新Schema
 */
export const pmTaskLabelUpdateReqSchema = pmTaskLabelCreateReqSchema
  .extend({
    id: pmTaskLabelSchema.shape.id,
  })
  .meta({ id: 'PmTaskLabelUpdateReq' })

export type PmTaskLabelQuery = z.infer<typeof pmTaskLabelQuerySchema>
export type PmTaskLabelCreateReq = z.infer<typeof pmTaskLabelCreateReqSchema>
export type PmTaskLabelUpdateReq = z.infer<typeof pmTaskLabelUpdateReqSchema>
