import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysCaptchaLog } from '@/schemas'

export const sysCaptchaLogSchema = createSelectSchema(sysCaptchaLog, {
  captchaId: (schema) =>
    schema.meta({ description: '验证码唯一标识', examples: ['123456'] }),
  captchaValue: (schema) =>
    schema.meta({ description: '验证码脱敏占位值', examples: ['123456'] }),
  captchaType: (schema) =>
    schema.meta({ description: '验证码类型', examples: [1] }),
  target: (schema) =>
    schema
      .optional()
      .nullable()
      .meta({
        description: '脱敏后的手机号、邮箱等接收目标',
        examples: ['13800000000'],
      }),
  platform: (schema) =>
    schema
      .optional()
      .nullable()
      .meta({ description: '平台', examples: [1] }),
  provider: (schema) =>
    schema
      .optional()
      .nullable()
      .meta({ description: '供应商', examples: [1] }),
  status: (schema) => schema.meta({ description: '状态', examples: [1] }),
  used: (schema) =>
    schema.meta({ description: '是否已使用', examples: [true] }),
  attempts: (schema) =>
    schema
      .optional()
      .nullable()
      .meta({ description: '尝试次数', examples: [1] }),
  expireAt: (schema) =>
    schema
      .optional()
      .nullable()
      .meta({ description: '过期时间', examples: ['2023-01-01 00:00:00'] }),
  usedAt: (schema) =>
    schema
      .optional()
      .nullable()
      .meta({ description: '使用时间', examples: ['2023-01-01 00:00:00'] }),
  ip: (schema) =>
    schema
      .optional()
      .nullable()
      .meta({ description: 'IP', examples: ['127.0.0.1'] }),
  payload: (schema) =>
    schema
      .optional()
      .nullable()
      .meta({ description: '验证码数据', examples: ['{}'] }),
  ...commonColumnsSchema,
})

export const sysCaptchaLogQuerySchema = baseQuerySchema
  .extend({
    captchaType: z
      .number()
      .int()
      .optional()
      .meta({ description: '验证码类型' }),
  })
  .meta({ id: 'SysCaptchaLogQuery' })

export const sysCaptchaLogCreateReqSchema = sysCaptchaLogSchema
  .omit({ id: true })
  .meta({
    id: 'SysCaptchaLogCreateReq',
  })

export const sysCaptchaLogUpdateReqSchema = sysCaptchaLogSchema.meta({
  id: 'SysCaptchaLogUpdateReq',
})

export type SysCaptchaLogQuery = z.infer<typeof sysCaptchaLogQuerySchema>
export type SysCaptchaLogCreateReq = z.infer<
  typeof sysCaptchaLogCreateReqSchema
>
export type SysCaptchaLogUpdateReq = z.infer<
  typeof sysCaptchaLogUpdateReqSchema
>
