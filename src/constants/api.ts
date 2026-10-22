import { HttpStatusCode } from '@dunx/http'

export const ApiStatus = {
  ...HttpStatusCode,
  /** 操作成功 */
  SUCCESS: 0,
  /** 通用业务错误 */
  ERR: 1,
  /** JSON 解析或处理失败 */
  JSON_ERROR: 40002,
  /** 未知错误 */
  UNKNOWN: 99999,
} as const

export type ApiStatusValue = (typeof ApiStatus)[keyof typeof ApiStatus]

/**
 * 常见 HTTP 状态码及业务状态码的默认消息。
 */
export const ApiStatusMessage = {
  [ApiStatus.OK]: '操作成功',
  [ApiStatus.CREATED]: '创建成功',
  [ApiStatus.ACCEPTED]: '请求已接受',
  [ApiStatus.NO_CONTENT]: '操作成功，无返回内容',

  [ApiStatus.BAD_REQUEST]: '请求参数有误',
  [ApiStatus.UNAUTHORIZED]: '请先登录后再继续操作',
  [ApiStatus.FORBIDDEN]: '暂无权限执行此操作',
  [ApiStatus.NOT_FOUND]: '请求的资源不存在',
  [ApiStatus.CONFLICT]: '请求与当前数据状态冲突',
  [ApiStatus.UNPROCESSABLE_ENTITY]: '请求参数校验失败',
  [ApiStatus.TOO_MANY_REQUESTS]: '请求过于频繁，请稍后再试',

  [ApiStatus.INTERNAL_SERVER_ERROR]: '服务器内部错误，请稍后再试',
  [ApiStatus.BAD_GATEWAY]: '上游服务响应异常',
  [ApiStatus.SERVICE_UNAVAILABLE]: '服务暂时不可用，请稍后再试',
  [ApiStatus.GATEWAY_TIMEOUT]: '上游服务响应超时',
  [ApiStatus.PAYLOAD_TOO_LARGE]: '请求数据超过大小限制',
  [ApiStatus.JSON_ERROR]: 'JSON 解析或处理异常',

  [ApiStatus.SUCCESS]: '操作成功',
  [ApiStatus.ERR]: '服务器内部错误，请稍后再试',
  [ApiStatus.UNKNOWN]: '未知错误，请联系管理员',
} as const satisfies Partial<Record<ApiStatusValue, string>>
