import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { pmProjectMemberSchema } from '@/schemas'

/**
 * 项目成员查询Schema
 */
export const pmProjectMemberQuerySchema = baseQuerySchema
  .extend({
    projectId: z.string().optional().meta({ description: '项目主键' }),
    userId: z.string().optional().meta({ description: '成员用户主键' }),
    role: z.coerce
      .number()
      .int()
      .optional()
      .meta({ description: '成员角色：1 负责人 2 管理员 3 成员 4 观察者' }),
  })
  .meta({ id: 'PmProjectMemberQuery' })

/**
 * 项目成员新增Schema
 */
export const pmProjectMemberCreateReqSchema = pmProjectMemberSchema
  .pick({
    projectId: true,
    userId: true,
    role: true,
  })
  .partial({
    role: true,
  })
  .meta({ id: 'PmProjectMemberCreateReq' })

/**
 * 项目成员更新Schema
 */
export const pmProjectMemberUpdateReqSchema = pmProjectMemberCreateReqSchema
  .extend({
    id: pmProjectMemberSchema.shape.id,
  })
  .meta({ id: 'PmProjectMemberUpdateReq' })

export type PmProjectMemberQuery = z.infer<typeof pmProjectMemberQuerySchema>
export type PmProjectMemberCreateReq = z.infer<
  typeof pmProjectMemberCreateReqSchema
>
export type PmProjectMemberUpdateReq = z.infer<
  typeof pmProjectMemberUpdateReqSchema
>
