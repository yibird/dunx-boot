import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysUser } from '@/schemas'

export const sysUserSchema = createSelectSchema(sysUser, {
  account: (schema) =>
    schema.meta({ description: '账号', examples: ['admin'] }),
  password: (schema) =>
    schema.meta({ description: '密码', examples: ['123456'] }),
  nickname: (schema) =>
    schema.meta({ description: '昵称', examples: ['管理员'] }),
  avatar: (schema) =>
    schema.meta({
      description: '头像',
      examples: ['https://example.com/avatar.jpg'],
    }),
  sex: (schema) => schema.meta({ description: '性别', examples: [0] }),
  age: (schema) => schema.meta({ description: '年龄', examples: [30] }),
  phone: (schema) =>
    schema.meta({ description: '手机号', examples: ['13800000000'] }),
  idCard: (schema) =>
    schema.meta({
      description: '身份证号,可为空',
      examples: ['44030419900101001X'],
    }),
  email: (schema) =>
    schema.meta({ description: '邮箱', examples: ['admin@example.com'] }),
  roleId: (schema) => schema.meta({ description: '角色 id', examples: ['1'] }),
  deptId: (schema) => schema.meta({ description: '部门 id', examples: ['1'] }),
  postId: (schema) => schema.meta({ description: '岗位 id', examples: ['1'] }),
  ...commonColumnsSchema,
}).meta({ id: 'SysUser' })

export const sysUserQuerySchema = baseQuerySchema
  .extend({
    account: z
      .string()
      .optional()
      .meta({ description: '账号（模糊查询）', examples: ['admin'] }),
    nickname: z
      .string()
      .optional()
      .meta({ description: '昵称(模糊查询)', examples: ['我叫大笨蛋'] }),
    phone: z
      .string()
      .optional()
      .meta({ description: '手机号(模糊查询)', examples: ['13800000000'] }),
    roleName: z
      .string()
      .optional()
      .meta({ description: '角色名称(模糊查询)', examples: ['管理员'] }),
    deptName: z
      .string()
      .optional()
      .meta({ description: '部门名称(模糊查询)', examples: ['财务部'] }),
    postName: z
      .string()
      .optional()
      .meta({ description: '岗位名称(模糊查询)', examples: ['经理'] }),
  })
  .meta({ id: 'SysUserQuery' })

export const sysUserCreateReqSchema = sysUserSchema
  .pick({
    account: true,
    password: true,
    nickname: true,
    avatar: true,
    sex: true,
    age: true,
    phone: true,
    email: true,
    idCard: true,
    roleId: true,
    deptId: true,
    postId: true,
    sort: true,
    remark: true,
  })
  .meta({ id: 'SysUserCreateReq' })

export const sysUserUpdateReqSchema = sysUserSchema
  .pick({
    nickname: true,
    avatar: true,
    sex: true,
    age: true,
    phone: true,
    email: true,
    deptId: true,
    postId: true,
    sort: true,
    remark: true,
  })
  .meta({ id: 'SysUserUpdateReq' })

export type SysUserQuery = z.infer<typeof sysUserQuerySchema>
export type SysUserCreateReq = z.infer<typeof sysUserCreateReqSchema>
export type SysUserUpdateReq = z.infer<typeof sysUserUpdateReqSchema>

export const schema = {
  response: sysUserSchema,
  create: sysUserCreateReqSchema,
  update: sysUserUpdateReqSchema,
  query: sysUserQuerySchema,
}
