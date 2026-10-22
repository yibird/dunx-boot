import { cloneDeep, mergeWith } from 'es-toolkit'
import { getTenantId, sessionContext } from '@/infra/context'
import { DateUtils } from '@/utils'
import { DEFAULT_OPTIONS } from './constant'
import type { InferSelectModel } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import type {
  CrudAuditOptions,
  CrudPayload,
  CrudRepositoryOptions,
  CrudTenantOptions,
  CrudWriteMode,
} from './types'

/**
 * 合并默认选项：对象逐层深合并，**数组整体替换**。
 *
 * 不能用 `toMerged`：它按索引合并数组，`ignoreTables: []` 清不掉默认的
 * `['sys_tenant']`，传更长的数组还会留下默认数组的尾部。
 */
export function getOptions<
  TTable extends PgTable,
  TIgnore extends keyof InferSelectModel<TTable>,
>(
  options?: CrudRepositoryOptions<TTable, TIgnore>
): CrudRepositoryOptions<TTable, TIgnore> {
  if (!options?.table) {
    throw new Error('CrudRepository: 缺少表配置，子类必须在 super 里传入 table')
  }
  return mergeWith(cloneDeep(DEFAULT_OPTIONS), options, (_target, source) =>
    Array.isArray(source) ? source : undefined
  )
}

export function fillAudit(
  payload: CrudPayload,
  mode: CrudWriteMode,
  options?: CrudAuditOptions | null
) {
  const { enabled, columns } = options || {}
  if (!enabled || !columns) return payload

  const columnMap = {
    create: {
      at: columns.createdAt,
      by: columns.createdBy,
      byName: columns.createdByName,
    },
    update: {
      at: columns.updatedAt,
      by: columns.updatedBy,
      byName: columns.updatedByName,
    },
    delete: {
      at: columns.deletedAt,
      by: columns.deletedBy,
      byName: columns.deletedByName,
    },
  } as const

  const target = columnMap[mode]
  const operator = sessionContext.get()

  if (target.at) {
    Reflect.set(payload, target.at, DateUtils.format(new Date()))
  }

  // 拿不到操作人就跳过：写 null 会把列上的默认值覆盖掉，
  // 而 seeder / 定时任务这类会话只有 userId，没有 account
  if (target.by && operator?.userId !== undefined) {
    Reflect.set(payload, target.by, operator.userId)
  }
  if (target.byName && operator?.account !== undefined) {
    Reflect.set(payload, target.byName, operator.account)
  }
  return payload
}

export function fillTenant(
  payload: CrudPayload,
  options?: CrudTenantOptions | null
) {
  const { enabled, columnName } = options || {}
  if (!enabled || !columnName) return payload

  const sessionTenantId = sessionContext.get()?.tenantId
  if (sessionTenantId) {
    Reflect.set(payload, columnName, sessionTenantId)
    return payload
  }

  // 没有会话（注册这类公开写入口、种子、定时任务）不是错误：落到默认租户。
  // 调用方自己指定的租户优先——那种写法是显式跨租户写入，不该被默认值覆盖。
  if (payload[columnName] === undefined) {
    Reflect.set(payload, columnName, getTenantId())
  }
  return payload
}
