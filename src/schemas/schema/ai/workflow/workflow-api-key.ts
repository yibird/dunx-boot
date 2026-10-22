import { sql } from 'drizzle-orm'
import {
  bigint,
  index,
  pgTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'
import {
  AiWorkflowApiKeyStatus,
  type AiWorkflowApiKeyStatusValue,
} from '@/features/ai/workflow/constant'

/**
 * 工作流 API 密钥。
 *
 * 明文只在创建时返回一次；这里只保存哈希与可展示前缀。
 */
export const aiWorkflowApiKey = pgTable(
  'ai_workflow_api_key',
  {
    /**
     * 所属工作流 API 主键。
     */
    apiId: bigintString('api_id').notNull(),
    /**
     * 密钥名称。
     */
    name: varchar('name', { length: 100 }).notNull(),
    /**
     * 可展示的密钥前缀。
     */
    keyPrefix: varchar('key_prefix', { length: 16 }).notNull(),
    /**
     * 密钥哈希，绝不保存明文。
     */
    keyHash: varchar('key_hash', { length: 128 }).notNull(),
    /**
     * 密钥状态：active 可用、disabled 停用、revoked 已吊销。
     */
    status: varchar('status', { length: 20 })
      .$type<AiWorkflowApiKeyStatusValue>()
      .default(AiWorkflowApiKeyStatus.ACTIVE)
      .notNull(),
    /**
     * 过期时间；为空表示永不过期。
     */
    expiresAt: datetime('expires_at'),
    /**
     * 最近一次使用时间。
     */
    lastUsedAt: datetime('last_used_at'),
    /**
     * 累计调用次数。
     */
    usageCount: bigint('usage_count', { mode: 'number' }).default(0).notNull(),
    ...commonColumns,
  },
  (table) => [
    index('ai_workflow_api_key_api_idx').on(table.apiId),
    uniqueIndex('ai_workflow_api_key_hash_uidx')
      .on(table.keyHash)
      .where(sql`${table.deleted} = false`),
  ]
)

export type AiWorkflowApiKeyTable = typeof aiWorkflowApiKey
export type AiWorkflowApiKey = typeof aiWorkflowApiKey.$inferSelect
export type AiWorkflowApiKeyInsert = typeof aiWorkflowApiKey.$inferInsert
