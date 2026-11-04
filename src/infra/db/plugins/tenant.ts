import { sessionContext, getTenantId } from '../../context'
import { isNotNil } from 'es-toolkit'
import { eqIf } from '../utils'
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

/**
 * 生成租户写入值
 *
 * @param columnName 租户列名，默认 `tenantId`
 * @param tenantId 租户 ID；缺省取当前会话，无会话时回退默认租户
 * @returns 形如 `{ tenantId: '1' }` 的写入值
 */
export function withTenantValue(
  columnName = 'tenantId',
  tenantId: string = getTenantId()
): Record<string, string> {
  return { [columnName]: tenantId }
}

/**
 * 把租户 ID 写入给定对象
 *
 * 已显式指定租户的写入不会被会话或默认值覆盖。
 *
 * @param values 待写入数据
 * @param columnName 租户列名，默认 `tenantId`
 * @param tenantId 租户 ID；缺省取当前会话，无会话时回退默认租户
 * @returns 原对象（原地修改）
 */
export function withTenantValues<T extends Record<string, unknown>>(
  values: T,
  columnName = 'tenantId',
  tenantId?: string
): T {
  if (values[columnName] !== undefined) return values

  ;(values as Record<string, unknown>)[columnName] =
    tenantId ?? sessionContext.get()?.tenantId ?? getTenantId()
  return values
}
