import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { createSelectSchema } from 'drizzle-orm/zod'
import { sysDept, commonColumnsSchema } from '@/schemas'

export const sysDeptSchema = createSelectSchema(sysDept, {
  deptName: z.string().meta({ description: '部门名称' }),
  rootId: z.string().meta({ description: '根部门ID' }),
  parentId: z.string().meta({ description: '父部门ID' }),
  path: z.string().meta({ description: '部门路径' }),
  leaderId: z.string().meta({ description: '负责人ID' }),
  leaderName: z.string().meta({ description: '负责人名称' }),
  ...commonColumnsSchema,
}).meta({ id: 'SysDept' })

/**
 * 部门查询Schema
 */
export const SysDeptQuerySchema = baseQuerySchema
  .extend({
    deptName: z.string().optional().meta({ description: '部门名称' }),
    parentId: z.string().optional().meta({ description: '父部门ID' }),
  })
  .meta({ id: 'SysDeptQuery' })

/**
 * 岗位新增Schema
 */
export const SysDeptCreateReqSchema = sysDeptSchema
  .pick({
    deptName: true,
    rootId: true,
    parentId: true,
    leaderId: true,
    leaderName: true,
    sort: true,
    remark: true,
  })
  .meta({ id: 'SysDeptCreateReq' })

/**
 * 部门更新Schema
 */
export const SysDeptUpdateReqSchema = sysDeptSchema
  .pick({
    id: true,
    deptName: true,
    rootId: true,
    parentId: true,
    leaderId: true,
    leaderName: true,
    sort: true,
    remark: true,
  })
  .meta({ id: 'SysDeptUpdateReq' })

export type SysDeptQuery = z.infer<typeof SysDeptQuerySchema>
export type SysDeptCreateReq = z.infer<typeof SysDeptCreateReqSchema>
export type SysDeptUpdateReq = z.infer<typeof SysDeptUpdateReqSchema>
