import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { sysCaptchaLogSchema } from '@/schemas'

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
