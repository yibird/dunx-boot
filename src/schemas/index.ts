export * from './schema'
export * from './types'
export * from './common'
import { relations } from './relations'
import * as schema from './schema'

/**
 * 兼容现有数据库泛型；Drizzle 1.0 使用关系配置而非表与关系的混合对象。
 */
export const appSchema = relations
export { schema }
export { relations }
