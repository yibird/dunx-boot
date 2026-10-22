import { CRUD_ENDPOINTS, type CrudEndpoint } from './constant'

/**
 * 获取排除的端点
 *
 * @param options 包含/排除端点的选项
 * @returns 排除的端点数组
 */
export function getExcludes(options: {
  readonly includes?: readonly CrudEndpoint[]
  readonly excludes?: readonly CrudEndpoint[]
}): readonly CrudEndpoint[] {
  const selected = options.includes ?? CRUD_ENDPOINTS
  const excluded = new Set(options.excludes)
  return CRUD_ENDPOINTS.filter(
    (endpoint) => !selected.includes(endpoint) || excluded.has(endpoint)
  )
}

/**
 * 获取权限前缀：驼峰按词拆开、转小写，再用分隔符连接。
 * `SysPost` → `sys:post`、`SysDictType` → `sys:dict:type`、`HTTPServer` →
 * `http:server`；已经用 `-`/`_`/空格 分好词的也认（`sys-post` → `sys:post`）。
 *
 * @param modelName 组件名前缀，如 `SysPost`
 * @param separator 词间分隔符，缺省 `:`
 * @returns 权限前缀；`modelName` 为空时返回空串
 */
export function getPermissionPrefix(
  modelName?: string,
  separator = ':'
): string {
  if (!modelName) return ''
  return modelName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase())
    .join(separator)
}

/**
 * 获取权限字符串：`modelName` 派生前缀 + 端点名
 *
 * @param action 端点名（动作）
 * @param options 组件名前缀与分隔符（分隔符缺省 `:`）
 * @returns 完整的权限字符串；`modelName` 为空时就是端点名本身
 */
export function getPermission(
  action: string,
  options: {
    modelName?: string
    permissionSeparator?: string
  }
) {
  const separator = options.permissionSeparator ?? ':'
  const prefix = getPermissionPrefix(options.modelName, separator)
  return prefix ? `${prefix}${separator}${action}` : action
}

/**
 * 获取 OpenAPI 标签：配了就用配的，否则回退到组件名前缀
 *
 * @param options 标签与组件名前缀
 * @returns 标签数组
 */
export function getTags(options: {
  readonly tags?: readonly string[]
  readonly modelName?: string
}): readonly string[] {
  return options.tags ?? (options.modelName ? [options.modelName] : [])
}
