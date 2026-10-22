import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { pmProjectSchema } from '@/schemas'

/**
 * 项目查询Schema
 */
export const pmProjectQuerySchema = baseQuerySchema
  .extend({
    projectName: z
      .string()
      .optional()
      .meta({ description: '项目名称（模糊查询）' }),
    status: z.coerce.number().int().optional().meta({
      description: '项目状态：1 未开始 2 进行中 3 已完成 4 已归档 5 已取消',
    }),
    priority: z.coerce
      .number()
      .int()
      .optional()
      .meta({ description: '项目优先级：1 低 2 中 3 高' }),
    ownerId: z.string().optional().meta({ description: '项目负责人' }),
  })
  .meta({ id: 'PmProjectQuery' })

/**
 * 项目新增Schema
 */
export const pmProjectCreateReqSchema = pmProjectSchema
  .pick({
    projectName: true,
    projectCode: true,
    description: true,
    status: true,
    priority: true,
    ownerId: true,
    startDate: true,
    endDate: true,
    sort: true,
    remark: true,
  })
  .partial({
    projectCode: true,
    description: true,
    status: true,
    priority: true,
    ownerId: true,
    startDate: true,
    endDate: true,
    sort: true,
    remark: true,
  })
  .meta({ id: 'PmProjectCreateReq' })

/**
 * 项目更新Schema
 */
export const pmProjectUpdateReqSchema = pmProjectCreateReqSchema
  .extend({
    id: pmProjectSchema.shape.id,
  })
  .meta({ id: 'PmProjectUpdateReq' })

export type PmProjectQuery = z.infer<typeof pmProjectQuerySchema>
export type PmProjectCreateReq = z.infer<typeof pmProjectCreateReqSchema>
export type PmProjectUpdateReq = z.infer<typeof pmProjectUpdateReqSchema>
