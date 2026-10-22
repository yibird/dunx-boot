import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysUser } from '@/schemas'
import { createSelectSchema } from 'drizzle-orm/zod'

export const sysUserSchema = createSelectSchema(sysUser, {
  account: z.string().meta({ description: '账号', example: 'admin' }),
  password: z.string().meta({ description: '密码', example: '123456' }),
  nickname: z.string().meta({ description: '昵称', example: '管理员' }),
  avatar: z
    .string()
    .meta({ description: '头像', example: 'https://example.com/avatar.jpg' }),
  sex: z.number().meta({ description: '性别', example: 0 }),
  age: z.number().meta({ description: '年龄', example: 30 }),
  phone: z
    .string()
    .nullable()
    .optional()
    .meta({ description: '手机号', example: '13800000000' }),
  idCard: z
    .string()
    .refine(
      (value) =>
        value === '' ||
        /^[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(
          value
        ),
      { message: '身份证号格式不正确' }
    )
    .nullable()
    .optional()
    .meta({
      description: '身份证号,可为空',
      example: '44030419900101001X',
    }),
  email: z
    .union([z.email(), z.literal('')])
    .nullable()
    .optional()
    .meta({ description: '邮箱', example: 'admin@example.com' }),
  roleId: z
    .string()
    .nullable()
    .optional()
    .meta({ description: '角色 id', example: '1' }),
  deptId: z
    .string()
    .nullable()
    .optional()
    .meta({ description: '部门 id', example: '1' }),
  postId: z
    .string()
    .nullable()
    .optional()
    .meta({ description: '岗位 id', example: '1' }),
  ...commonColumnsSchema,
}).meta({ id: 'SysUser' })

export const sysUserQuerySchema = baseQuerySchema
  .extend({
    account: z.string().optional().meta({ description: '账号（模糊查询）' }),
    nickname: z.string().optional().meta({ description: '昵称(模糊查询)' }),
    phone: z.string().optional().meta({ description: '手机号(模糊查询)' }),
    roleName: z.string().optional().meta({ description: '角色名称(模糊查询)' }),
    deptName: z.string().optional().meta({ description: '部门名称(模糊查询)' }),
    postName: z.string().optional().meta({ description: '岗位名称(模糊查询)' }),
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
