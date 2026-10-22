import type { Api } from '../model'

/**
 * 跨层共享的词汇：数据层、服务层、控制器层都认这几个形状。
 *
 * 各层自己的类型跟着各自目录走——控制器见 `controller/types.ts`，数据层见
 * `repository/types.ts`。往这里加东西之前先问一句：它是不是只属于某一层？
 * 只属于某一层的，放回那一层去。
 */

/**
 * 主键值类型。
 */
export type CrudId = string | number

/**
 * 分页结果。
 */
export interface CrudPageResult<T> {
  readonly list: T[]
  readonly total: number
}

/**
 * 统一响应体：直接取自 `Api.ok` 的返回结构，与实现保持一致。
 */
export type ApiPayload<T> = ReturnType<typeof Api.ok<T>>
