import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { pmTaskSchema } from '@/schemas'

/**
 * 任务查询Schema
 */
export const pmTaskQuerySchema = baseQuerySchema
  .extend({
    projectId: z.string().optional().meta({ description: '所属项目主键' }),
    parentId: z
      .string()
      .optional()
      .meta({ description: '父任务主键；为空表示顶层任务' }),
    title: z.string().optional().meta({ description: '任务标题（模糊查询）' }),
    status: z.coerce
      .number()
      .int()
      .optional()
      .meta({ description: '任务状态：1 待办 2 进行中 3 已完成 4 已取消' }),
    priority: z.coerce
      .number()
      .int()
      .optional()
      .meta({ description: '任务优先级：1 低 2 中 3 高 4 紧急' }),
    assigneeId: z.string().optional().meta({ description: '任务负责人' }),
  })
  .meta({ id: 'PmTaskQuery' })

/**
 * 任务新增Schema
 */
export const pmTaskCreateReqSchema = pmTaskSchema
  .pick({
    projectId: true,
    parentId: true,
    title: true,
    description: true,
    status: true,
    priority: true,
    assigneeId: true,
    startDate: true,
    dueDate: true,
    completedAt: true,
    progress: true,
    sort: true,
    remark: true,
  })
  .partial({
    parentId: true,
    description: true,
    status: true,
    priority: true,
    assigneeId: true,
    startDate: true,
    dueDate: true,
    completedAt: true,
    progress: true,
    sort: true,
    remark: true,
  })
  .meta({ id: 'PmTaskCreateReq' })

/**
 * 任务更新Schema
 */
export const pmTaskUpdateReqSchema = pmTaskCreateReqSchema
  .extend({
    id: pmTaskSchema.shape.id,
  })
  .meta({ id: 'PmTaskUpdateReq' })

export type PmTaskQuery = z.infer<typeof pmTaskQuerySchema>
export type PmTaskCreateReq = z.infer<typeof pmTaskCreateReqSchema>
export type PmTaskUpdateReq = z.infer<typeof pmTaskUpdateReqSchema>
