import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { createSelectSchema } from 'drizzle-orm/zod'
import { sysDept, commonColumnsSchema } from '@/schemas'

export const sysDeptSchema = createSelectSchema(sysDept, {
  deptName: (schema) =>
    schema.meta({ description: '部门名称', examples: ['财务部'] }),
  rootId: (schema) => schema.meta({ description: '根部门ID', examples: ['1'] }),
  parentId: (schema) =>
    schema.meta({ description: '父部门ID', examples: ['1'] }),
  path: (schema) =>
    schema.meta({ description: '部门路径', examples: ['/1/2/3'] }),
  leaderId: (schema) =>
    schema.nullable().meta({ description: '负责人ID', examples: ['1'] }),
  leaderName: (schema) =>
    schema.nullable().meta({ description: '负责人名称', examples: ['张三'] }),
  leaderPhone: (schema) =>
    schema
      .nullable()
      .meta({ description: '负责人手机号', examples: ['13800000000'] }),
  leaderEmail: (schema) =>
    schema
      .nullable()
      .meta({ description: '负责人邮箱', examples: ['zhangsan@example.com'] }),
  ...commonColumnsSchema,
}).meta({ id: 'SysDept' })

/**
 * 部门查询Schema
 */
export const sysDeptQuerySchema = baseQuerySchema
  .extend({
    deptName: z.string().optional().meta({ description: '部门名称' }),
    parentId: z.string().optional().meta({ description: '父部门ID' }),
  })
  .meta({ id: 'SysDeptQuery' })

/**
 * 岗位新增Schema
 */
export const sysDeptCreateReqSchema = sysDeptSchema
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
export const sysDeptUpdateReqSchema = sysDeptSchema
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

export type SysDeptQuery = z.infer<typeof sysDeptQuerySchema>
export type SysDeptCreateReq = z.infer<typeof sysDeptCreateReqSchema>
export type SysDeptUpdateReq = z.infer<typeof sysDeptUpdateReqSchema>

export const schema = {
  response: sysDeptSchema,
  create: sysDeptCreateReqSchema,
  update: sysDeptUpdateReqSchema,
  query: sysDeptQuerySchema,
}
