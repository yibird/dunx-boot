import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysRequestLog } from '@/schemas'

export const sysRequestLogSchema = createSelectSchema(sysRequestLog, {
  requestId: z.string().meta({ description: '请求ID', example: '10000001' }),
  traceId: z.string().meta({ description: '跟踪ID', example: '10000001' }),
  method: z.string().meta({ description: '请求方法', example: 'POST' }),
  url: z.string().meta({ description: '请求URL', example: '/api/user/login' }),
  success: z.boolean().meta({ description: '是否成功', example: true }),
  token: z.string().meta({ description: 'token', example: '123456' }),
  ip: z.string().meta({ description: 'IP', example: '127.0.0.1' }),
  userAgent: z.string().meta({
    description: '用户代理',
    example:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  }),
  headers: z.object().meta({ description: '请求头', example: {} }),
  params: z.object().meta({ description: '请求参数', example: {} }),
  response: z.object().meta({ description: '响应', example: {} }),
  statusCode: z.number().meta({ description: '状态码', example: 200 }),
  duration: z.number().meta({ description: '耗时', example: 1000 }),
  errorMessage: z.string().meta({ description: '错误信息', example: '' }),
  ...commonColumnsSchema,
})

export const sysRequestLogQuerySchema = baseQuerySchema
  .extend({
    requestId: z.string().meta({ description: '请求ID', example: '10000001' }),
    traceId: z.string().meta({ description: '跟踪ID', example: '10000001' }),
    method: z.string().meta({ description: '请求方法', example: 'POST' }),
    url: z
      .string()
      .meta({ description: '请求URL', example: '/api/user/login' }),
    success: z.boolean().meta({ description: '是否成功', example: true }),
    token: z.string().meta({ description: 'token', example: '123456' }),
    ip: z.string().meta({ description: 'IP', example: '127.0.0.1' }),
    statusCode: z.number().meta({ description: '状态码', example: 200 }),
  })
  .meta({ id: 'sysRequestLogQuery' })

export const sysRequestLogCreateReqSchema = sysRequestLogSchema.pick({
  requestId: true,
  traceId: true,
  method: true,
  url: true,
  success: true,
  token: true,
  ip: true,
  userAgent: true,
  headers: true,
  params: true,
  response: true,
  statusCode: true,
  duration: true,
  errorMessage: true,
})

export type SysRequestLogQuery = z.infer<typeof sysRequestLogQuerySchema>
export type SysRequestLogCreateReq = z.infer<
  typeof sysRequestLogCreateReqSchema
>
