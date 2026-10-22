import { meta, metaKey, type MetaKey, type MetaRecord } from '@dunx/http'

/**
 * 权限注解：把「访问这个端点需要哪些权限码」写进路由元数据。
 *
 * 和 `@Roles` / `@ApiDoc` 一样，装饰器只写元数据（`metaKey` + `meta`），
 * 判定交给守卫：{@link PermissionGuard} 读元数据、比对当前账号持有的权限码，
 * 对不上就 403。所以这里没有全局注册表，也没有第二套发现流程。
 *
 * ```ts
 * @Permission('sys:post:add')                     // 一个权限码
 * @Permission(['sys:post:add', 'sys:post:edit'])  // 一组权限码，任一命中即放行
 * @Permission('sys:post:add', 'sys:post:edit')    // 同上，展开写法
 * ```
 *
 * 可以写在方法上，也可以写在类上；方法上的优先（框架的合并规则：
 * 处理器元数据盖过类元数据）。
 */

/**
 * 权限元数据的键。
 */
export const PERMISSIONS: MetaKey<readonly string[]> =
  metaKey<readonly string[]>('permissions')

/**
 * 超级权限：账号持有它时，所有带 `@Permission` 的端点都放行。
 */
export const ALL_PERMISSIONS = '*'

/**
 * `@Permission` 的入参：一个权限码，或一组权限码。
 */
export type PermissionInput = string | readonly string[]

/**
 * 声明端点需要的权限码（任一命中即放行）。
 *
 * 空入参不写元数据：生成端没配权限时 `@Permission(...[])` 应该变成透明的，
 * 而不是让端点要求"零个权限"——`@Permission()` 等价于不写这个注解。
 */
export function Permission(
  ...input: readonly PermissionInput[]
): <F extends object>(target: F) => F {
  const codes = normalizePermissions(input)
  if (codes.length === 0) return (target) => target
  return meta(PERMISSIONS, codes)
}

/**
 * 把 `@Permission` 的入参摊平：去掉空串、去重、保留书写顺序。
 * `[' a ', ['b', 'a']]` → `['a', 'b']`。
 */
export function normalizePermissions(
  input: readonly PermissionInput[]
): readonly string[] {
  const codes = new Set<string>()
  for (const entry of input) {
    for (const code of typeof entry === 'string' ? [entry] : entry) {
      const trimmed = code.trim()
      if (trimmed.length > 0) codes.add(trimmed)
    }
  }
  return [...codes]
}

/**
 * 一条路由声明的权限码；没声明时 undefined。
 *
 * 守卫走的是 `RouteContext.get(PERMISSIONS)`（类与方法已经合并好），
 * 这里给的是同一个值的另一条读法：从元数据记录里读，供文档与测试使用。
 */
export function permissionsOf(
  record: MetaRecord | undefined
): readonly string[] | undefined {
  const value = record?.get(PERMISSIONS.id)
  if (!Array.isArray(value)) return undefined
  return value.filter((code): code is string => typeof code === 'string')
}

/**
 * 账号持有的权限码里，有没有一个能对上要求。
 *
 * - 要求为空 = 不校验，通过；
 * - 持有 {@link ALL_PERMISSIONS} = 全通过；
 * - 否则任一命中即通过（`some`，与框架 `@Roles` 和 Spring 的
 *   `hasAnyAuthority` 同一套语义）。
 */
export function matchesPermission(
  held: readonly string[],
  required: readonly string[]
): boolean {
  if (required.length === 0) return true
  if (held.includes(ALL_PERMISSIONS)) return true
  return required.some((code) => held.includes(code))
}
