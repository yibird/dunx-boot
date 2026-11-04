import type { PgTable } from 'drizzle-orm/pg-core'
import type { CrudPlugin } from './plugin'
import { auditPlugin } from './plugins/audit'
import { optimisticLockPlugin } from './plugins/optimistic-lock'
import { softDeletePlugin } from './plugins/soft-delete'
import { tenantPlugin } from './plugins/tenant'

/**
 * 默认插件集：租户隔离 → 软删除 → 审计 → 乐观锁。
 *
 * 字段过滤不是插件：查询结果中省略的列由 `RepositoryOptions.ignoreColumns` 控制。
 */
export function defaultPlugins<TTable extends PgTable>(): CrudPlugin<TTable>[] {
  return [
    tenantPlugin(),
    softDeletePlugin(),
    auditPlugin(),
    optimisticLockPlugin(),
  ]
}

/**
 * 合并插件：同名插件以调用方传入的为准，未提供则完全使用默认插件。
 */
export function mergePlugins<TTable extends PgTable>(
  base: readonly CrudPlugin<TTable>[],
  overrides?: readonly CrudPlugin<TTable>[]
): CrudPlugin<TTable>[] {
  if (!overrides || overrides.length === 0) return [...base]
  const byName = new Map<string, CrudPlugin<TTable>>()
  for (const plugin of base) byName.set(plugin.name, plugin)
  for (const plugin of overrides) byName.set(plugin.name, plugin)
  return [...byName.values()]
}
