import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysPost } from '@/schemas'

export const sysPostSchema = createSelectSchema(sysPost, {
  postName: z.string().meta({ description: '岗位名称', example: '管理员' }),
  postLevel: z.number().meta({ description: '岗位等级', example: 2 }),
  ...commonColumnsSchema,
}).meta({ id: 'SysPost' })

/**
 * 岗位查询Schema
 */
export const sysPostQuerySchema = baseQuerySchema
  .extend({
    postName: z
      .string()
      .optional()
      .meta({ description: '岗位名称（模糊查询）' }),
    postLevel: z.coerce
      .number()
      .int()
      .optional()
      .meta({ description: '岗位级别' }),
  })
  .meta({ id: 'SysPostQuery' })

/**
 * 岗位新增Schema
 */
export const sysPostCreateReqSchema = sysPostSchema
  .pick({
    postName: true,
    postLevel: true,
    remark: true,
  })
  .meta({ id: 'SysPostCreateReq' })

/**
 * 岗位更新Schema
 */
export const sysPostUpdateReqSchema = sysPostCreateReqSchema
  .extend({
    id: sysPostSchema.shape.id,
  })
  .meta({ id: 'SysPostUpdateReq' })

export type SysPostQuery = z.infer<typeof sysPostQuerySchema>
export type SysPostCreateReq = z.infer<typeof sysPostCreateReqSchema>
export type SysPostUpdateReq = z.infer<typeof sysPostUpdateReqSchema>
