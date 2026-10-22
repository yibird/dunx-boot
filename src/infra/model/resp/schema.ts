import { z, type ZodType } from 'zod'
import { ApiStatus, ApiStatusMessage, type ApiStatusValue } from '@/constants'

/**
 * 构建成功响应 schema；无数据时 data 为 null。
 *
 * 缺省**不写组件 id**：成功信封里 `data` 因域而异，共用一个 id 会被生成器
 * 按「先到先得」去重，导致每个端点都渲染成第一个实体的形状。需要复用组件时
 * 由调用方传 `name`（如 `apiOkSchema(sysUserSchema, 'SysUserResp')`）。
 *
 * @param data 数据载荷 schema
 * @param name 可选的 OpenAPI 组件名称；未提供时生成内联 schema
 * @return 包装后的成功响应 schema
 */
export function apiOkSchema<T extends ZodType>(data?: T, name?: string) {
  const schema = z
    .object({
      code: z.literal(ApiStatus.SUCCESS).meta({
        description: '响应状态码(0表示成功,非0为错误)',
        example: ApiStatus.SUCCESS,
      }),
      message: z.string().optional().meta({
        description: '响应消息',
        example: ApiStatusMessage[ApiStatus.SUCCESS],
      }),
      data: data ?? z.null().optional().meta({ description: '响应数据' }),
    })
    .meta({ description: '统一成功响应体' })
  return name ? schema.meta({ id: name }) : schema
}

/**
 * 构建错误响应 schema，`code` 就是状态码本身，消息示例按状态码获取。
 *
 * id 带上状态码（`ApiErrResponse401`）：信封结构与成功响应不同，绝不能
 * 共用 id；而各状态码之间只有 code 与消息示例不同，各自成组件反而能跨端点复用。
 *
 * @param status 响应状态码，同时作为响应体 code
 * @return 包装后的错误响应 schema
 */
export function apiErrSchema(status: ApiStatusValue = ApiStatus.ERR) {
  const message =
    status in ApiStatusMessage
      ? ApiStatusMessage[status as keyof typeof ApiStatusMessage]
      : ApiStatusMessage[ApiStatus.ERR]
  return z
    .object({
      code: z.literal(status).meta({
        description: '响应状态码(0表示成功,非0为错误)',
        example: status,
      }),
      message: z.string().optional().meta({
        description: '响应消息',
        example: message,
      }),
      data: z.null().optional().meta({ description: '响应数据' }),
    })
    .meta({ id: `ApiErrResponse${status}`, description: '统一错误响应体' })
}

/**
 * 构建分页响应包装 schema
 *
 * @param item 列表元素的数据 schema
 * @return 包装后的 OpenAPI 分页响应 schema
 */
export function pageSchema<S extends ZodType>(item: S) {
  const page = z.object({
    list: z.array(item).meta({ description: '当前页的数据列表' }),
    total: z.number().int().meta({
      description: '记录总数',
      example: 42,
    }),
    current: z.number().int().meta({
      description: '当前页码',
      example: 1,
    }),
    pageSize: z.number().int().meta({
      description: '每页记录数',
      example: 20,
    }),
    pages: z.number().int().meta({
      description: '总页数(由 total 与 pageSize 推导)',
      example: 3,
    }),
  })
  return apiOkSchema(page)
}

const errorResponses = {
  [ApiStatus.UNAUTHORIZED]: apiErrSchema(ApiStatus.UNAUTHORIZED),
  [ApiStatus.FORBIDDEN]: apiErrSchema(ApiStatus.FORBIDDEN),
  [ApiStatus.NOT_FOUND]: apiErrSchema(ApiStatus.NOT_FOUND),
  [ApiStatus.BAD_REQUEST]: apiErrSchema(ApiStatus.BAD_REQUEST),
  [ApiStatus.INTERNAL_SERVER_ERROR]: apiErrSchema(
    ApiStatus.INTERNAL_SERVER_ERROR
  ),
} as const

/**
 * 构建 API 路由响应
 *
 * @param schema 数据载荷 schema
 * @returns 包装后的 OpenAPI 响应 schema
 */
export function apiRouteResponse<T extends ZodType>(schema?: T) {
  return {
    [ApiStatus.OK]: apiOkSchema(schema),
    ...errorResponses,
  } as const
}
