import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysRequestLog } from '@/schemas'

export const sysRequestLogSchema = createSelectSchema(sysRequestLog, {
  requestId: (schema) =>
    schema.meta({ description: '请求ID', examples: ['10000001'] }),
  traceId: (schema) =>
    schema.meta({ description: '跟踪ID', examples: ['10000001'] }),
  method: (schema) =>
    schema.meta({ description: '请求方法', examples: ['POST'] }),
  url: (schema) =>
    schema.meta({ description: '请求URL', examples: ['/api/user/login'] }),
  success: (schema) =>
    schema.meta({ description: '是否成功', examples: [true] }),
  token: (schema) =>
    schema.meta({ description: 'token', examples: ['123456'] }),
  ip: (schema) => schema.meta({ description: 'IP', examples: ['127.0.0.1'] }),
  userAgent: (schema) =>
    schema.meta({
      description: '用户代理',
      examples: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      ],
    }),
  headers: (schema) => schema.meta({ description: '请求头', examples: [{}] }),
  params: (schema) => schema.meta({ description: '请求参数', examples: [{}] }),
  response: (schema) => schema.meta({ description: '响应', examples: [{}] }),
  statusCode: (schema) =>
    schema.meta({ description: '状态码', examples: [200] }),
  duration: (schema) => schema.meta({ description: '耗时', examples: [1000] }),
  errorMessage: (schema) =>
    schema.meta({ description: '错误信息', examples: [''] }),
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
