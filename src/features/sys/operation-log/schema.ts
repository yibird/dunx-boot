import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysOperationLog } from '@/schemas'

export const SysOperationLogSchema = createSelectSchema(sysOperationLog, {
  userId: z
    .string()
    .optional()
    .meta({ description: '操作用户主键', example: '123456' }),
  username: z
    .string()
    .optional()
    .meta({ description: '操作用户账号快照', example: 'admin' }),
  module: z
    .string()
    .optional()
    .meta({ description: '操作模块', example: 'user' }),
  action: z
    .string()
    .optional()
    .meta({ description: '操作类型', example: 'USER_CREATE' }),
  businessType: z
    .string()
    .optional()
    .meta({ description: '业务类型', example: 'user' }),
  businessId: z
    .string()
    .optional()
    .meta({ description: '业务主键', example: '123456' }),
  description: z
    .string()
    .optional()
    .meta({ description: '操作描述', example: '创建用户' }),
  beforeData: z.object().optional().meta({ description: '修改前数据快照' }),
  afterData: z.object().optional().meta({ description: '修改后数据快照' }),
  requestMethod: z
    .string()
    .optional()
    .meta({ description: '触发操作的 HTTP 方法', example: 'POST' }),
  requestUrl: z
    .string()
    .optional()
    .meta({ description: '触发操作的请求地址', example: '/user' }),
  ip: z
    .string()
    .optional()
    .meta({ description: '客户端 IP', example: '192.168.1.1' }),
  userAgent: z
    .string()
    .optional()
    .meta({ description: '客户端 User-Agent', example: 'Mozilla/5.0' }),
  traceId: z
    .string()
    .optional()
    .meta({ description: '链路追踪 ID', example: '123456' }),
  success: z
    .boolean()
    .optional()
    .meta({ description: '操作是否成功', example: true }),
  errorMessage: z
    .string()
    .optional()
    .meta({ description: '操作失败时的错误信息', example: '用户不存在' }),
  ...commonColumnsSchema,
}).meta({ id: 'SysOperationLog' })

export const SysOperationLogCreateSchema = createInsertSchema(sysOperationLog)
export const SysOperationLogUpdateSchema = createUpdateSchema(sysOperationLog)

/**
 * 分页查询：在通用分页参数上追加业务过滤字段。
 */
export const SysOperationLogQuery = baseQuerySchema
  .extend({
    module: z.string().optional().meta({ description: '操作模块' }),
    action: z.string().optional().meta({ description: '操作类型' }),
    username: z.string().optional().meta({ description: '操作账号' }),
    success: z.stringbool().optional().meta({ description: '是否成功' }),
  })
  .meta({ id: 'SysOperationLogQuery' })
export type SysOperationLogQuery = z.infer<typeof SysOperationLogQuery>
