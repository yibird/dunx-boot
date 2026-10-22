import { sessionContext } from '../../context'
import { isNotNil } from 'es-toolkit'
import { eqIf } from './condition'
import type { AnyColumn, SQL } from 'drizzle-orm'

/**
 * 生成租户数据隔离条件。
 *
 * 从当前会话上下文获取租户 ID，并生成对应的列相等条件。
 * 如果当前会话不存在租户 ID，则不添加过滤条件。
 *
 * @param columns 租户 ID 对应的列定义
 * @returns 租户过滤条件；未获取到租户 ID 时返回 undefined
 */
export function withTenant(columns: AnyColumn): SQL | undefined {
  const tenantId = sessionContext?.get()?.tenantId
  return isNotNil(tenantId) ? eqIf(columns, tenantId) : undefined
}
