import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { pmTaskActivitySchema } from '@/schemas'

/**
 * 任务动态查询Schema
 */
export const pmTaskActivityQuerySchema = baseQuerySchema
  .extend({
    projectId: z.string().optional().meta({ description: '所属项目主键' }),
    taskId: z.string().optional().meta({ description: '任务主键' }),
    userId: z.string().optional().meta({ description: '操作人主键' }),
    action: z.string().optional().meta({
      description:
        '动作：create 创建 update 更新 status 变更状态 assign 变更负责人 comment 新增评论 attachment 新增附件 delete 删除任务',
    }),
  })
  .meta({ id: 'PmTaskActivityQuery' })

/**
 * 任务动态新增Schema
 */
export const pmTaskActivityCreateReqSchema = pmTaskActivitySchema
  .pick({
    projectId: true,
    taskId: true,
    userId: true,
    action: true,
    field: true,
    beforeValue: true,
    afterValue: true,
    content: true,
  })
  .partial({
    userId: true,
    field: true,
    beforeValue: true,
    afterValue: true,
    content: true,
  })
  .meta({ id: 'PmTaskActivityCreateReq' })

/**
 * 任务动态更新Schema
 */
export const pmTaskActivityUpdateReqSchema = pmTaskActivityCreateReqSchema
  .extend({
    id: pmTaskActivitySchema.shape.id,
  })
  .meta({ id: 'PmTaskActivityUpdateReq' })

export type PmTaskActivityQuery = z.infer<typeof pmTaskActivityQuerySchema>
export type PmTaskActivityCreateReq = z.infer<
  typeof pmTaskActivityCreateReqSchema
>
export type PmTaskActivityUpdateReq = z.infer<
  typeof pmTaskActivityUpdateReqSchema
>
