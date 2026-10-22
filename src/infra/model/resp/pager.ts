import type { BaseQuery } from '../query'

/**
 * 分页数据载荷，用作列表类接口中 {@link Api} 的 `data`。
 *
 * - `list`     当前页的记录
 * - `total`    所有页的记录总数
 * - `current`  当前页码（从 1 开始）
 * - `pageSize` 每页记录数
 * - `pages`    总页数（推导得出）
 */
export class Pager<T> {
  list: T[]
  total: number
  current: number
  pageSize: number
  pages: number

  constructor(
    list: T[],
    total: number,
    current: number,
    pageSize: number,
    pages: number
  ) {
    this.list = list
    this.total = total
    this.current = current
    this.pageSize = pageSize
    this.pages = pages
  }

  /**
   * 构建分页数据载荷，根据 `total` 与 `pageSize` 计算总页数。
   * @param list 当前页的记录
   * @param total 所有页的记录总数
   * @param query 分页参数
   * @return 计算好总页数的分页数据载荷实例
   */
  static of<T>(list: T[], total: number, query?: Partial<BaseQuery>) {
    const pageSize = query?.pageSize ?? 10
    const current = query?.current ?? 1
    const size = pageSize > 0 ? pageSize : 1
    const pages = total > 0 ? Math.ceil(total / size) : 0
    return new Pager(list, total, current, pageSize, pages)
  }

  /**
   * 解析并归一化分页参数：`current` 至少为 1，`pageSize` 限制在 `[1, maxPageSize]`。
   *
   * @param query 分页参数
   * @param maxPageSize 每页条数上限，默认 1000
   * @return 归一化后的 `current`、`pageSize` 与 `offset`
   */
  static getPagination<Q extends Partial<BaseQuery> | undefined = BaseQuery>(
    query?: Q,
    maxPageSize = 1000
  ) {
    const currentValue = query?.current ?? 1
    // 页码同样取整：`OFFSET 1.5` 在 Postgres 是错误，不是四舍五入
    const current = Number.isFinite(currentValue)
      ? Math.max(Math.floor(currentValue), 1)
      : 1
    const rawPageSize = query?.pageSize ?? 10
    const pageSize = Number.isFinite(rawPageSize)
      ? Math.min(Math.max(Math.floor(rawPageSize), 1), maxPageSize)
      : 10
    const offset = (current - 1) * pageSize
    return {
      current,
      pageSize,
      offset,
    }
  }
}
