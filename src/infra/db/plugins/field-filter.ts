/**
 * 过滤掉不允许写入的字段
 *
 * 返回新对象，不修改入参。
 *
 * @param values 原始写入数据
 * @param ignoreFields 禁止写入的字段
 * @returns 过滤后的写入数据
 */
export function withFilteredFields<T extends Record<string, unknown>>(
  values: T,
  ignoreFields: readonly string[]
): Partial<T> {
  if (ignoreFields.length === 0) return { ...values }

  const ignored = new Set(ignoreFields)
  return Object.fromEntries(
    Object.entries(values).filter(([key]) => !ignored.has(key))
  ) as Partial<T>
}
