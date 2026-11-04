import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysOperationLog } from '@/schemas'

export const SysOperationLogSchema = createSelectSchema(sysOperationLog, {
  userId: (schema) =>
    schema
      .optional()
      .meta({ description: '操作用户主键', examples: ['123456'] }),
  username: (schema) =>
    schema
      .optional()
      .meta({ description: '操作用户账号快照', examples: ['admin'] }),
  module: (schema) =>
    schema.meta({ description: '操作模块', examples: ['user'] }),
  action: (schema) =>
    schema.meta({ description: '操作类型', examples: ['USER_CREATE'] }),
  businessType: (schema) =>
    schema.meta({ description: '业务类型', examples: ['user'] }),
  businessId: (schema) =>
    schema.meta({ description: '业务主键', examples: ['123456'] }),
  description: (schema) =>
    schema.meta({ description: '操作描述', examples: ['创建用户'] }),
  beforeData: (schema) =>
    schema.meta({ description: '修改前数据快照', examples: [{}] }),
  afterData: (schema) =>
    schema.meta({ description: '修改后数据快照', examples: [{}] }),
  requestMethod: (schema) =>
    schema.meta({ description: '触发操作的 HTTP 方法', examples: ['POST'] }),
  requestUrl: (schema) =>
    schema.meta({ description: '触发操作的请求地址', examples: ['/user'] }),
  ip: (schema) =>
    schema.meta({ description: '客户端 IP', examples: ['192.168.1.1'] }),
  userAgent: (schema) =>
    schema.meta({
      description: '客户端 User-Agent',
      examples: ['Mozilla/5.0'],
    }),
  traceId: (schema) =>
    schema.meta({ description: '链路追踪 ID', examples: ['123456'] }),
  success: (schema) =>
    schema.meta({ description: '操作是否成功', examples: [true] }),
  errorMessage: (schema) =>
    schema.optional().meta({
      description: '操作失败时的错误信息',
      examples: ['用户不存在'],
    }),
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
