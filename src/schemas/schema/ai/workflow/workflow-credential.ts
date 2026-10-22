import { sql } from 'drizzle-orm'
import { index, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'
import {
  AiWorkflowCredentialScope,
  AiWorkflowCredentialStatus,
  AiWorkflowCredentialType,
  type AiWorkflowCredentialScopeValue,
  type AiWorkflowCredentialStatusValue,
  type AiWorkflowCredentialTypeValue,
} from '@/features/ai/workflow/constant'

/**
 * 工作流凭据。
 *
 * 节点通过凭据 ID 引用，敏感内容以加密后的形式存放，绝不落明文。
 */
export const aiWorkflowCredential = pgTable(
  'ai_workflow_credential',
  {
    /**
     * 所有者用户主键。
     */
    ownerUserId: bigintString('owner_user_id'),
    /**
     * 凭据名称，租户内唯一。
     */
    name: varchar('name', { length: 100 }).notNull(),
    /**
     * 凭据类型：api_key、oauth2、basic、database、custom。
     */
    credentialType: varchar('credential_type', { length: 50 })
      .$type<AiWorkflowCredentialTypeValue>()
      .default(AiWorkflowCredentialType.API_KEY)
      .notNull(),
    /**
     * 加密后的凭据内容。
     */
    encryptedData: text('encrypted_data').notNull(),
    /**
     * 作用域：private 仅所有者、tenant 租户内共享、public 租户内公开。
     */
    scope: varchar('scope', { length: 20 })
      .$type<AiWorkflowCredentialScopeValue>()
      .default(AiWorkflowCredentialScope.PRIVATE)
      .notNull(),
    /**
     * 凭据状态：active、disabled、expired。
     */
    status: varchar('status', { length: 20 })
      .$type<AiWorkflowCredentialStatusValue>()
      .default(AiWorkflowCredentialStatus.ACTIVE)
      .notNull(),
    /**
     * 过期时间；为空表示永不过期。
     */
    expiresAt: datetime('expires_at'),
    /**
     * 最近一次使用时间。
     */
    lastUsedAt: datetime('last_used_at'),
    ...commonColumns,
  },
  (table) => [
    index('ai_workflow_credential_owner_idx').on(table.ownerUserId),
    uniqueIndex('ai_workflow_credential_name_uidx')
      .on(table.tenantId, table.name)
      .where(sql`${table.deleted} = false`),
  ]
)

export type AiWorkflowCredentialTable = typeof aiWorkflowCredential
export type AiWorkflowCredential = typeof aiWorkflowCredential.$inferSelect
export type AiWorkflowCredentialInsert =
  typeof aiWorkflowCredential.$inferInsert
