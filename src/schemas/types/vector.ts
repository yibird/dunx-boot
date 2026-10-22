import { customType } from 'drizzle-orm/pg-core'

/**
 * 向量列类型。
 *
 * 使用 `jsonb` 存储浮点数组，避免对 pgvector 扩展的依赖；
 * 检索时可加载到应用层或用外部向量库完成相似度计算。
 */
export const pgVector = customType<{
  data: number[]
  driverData: string
  driverOutput: unknown
}>({
  dataType: () => 'jsonb',
  toDriver: (value) => JSON.stringify(value),
  fromDriver: (value) => {
    if (Array.isArray(value)) return value.map(Number)
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed.map(Number) : []
      } catch {
        return []
      }
    }
    return []
  },
})
