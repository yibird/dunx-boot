import { createSelectSchema } from 'drizzle-orm/zod'
import { z } from 'zod'
import { aiChatSession } from '@/schemas'
import { commonColumnsSchema } from '@/schemas/common'

export const aiChatSessionSchema = createSelectSchema(aiChatSession, {
  chatId: z.string().nullable(),
  ownerUserId: z.string(),
  agentId: z.string().nullable(),
  modelId: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  ...commonColumnsSchema,
}).meta({ id: 'AiChatSession' })

export const aiChatSessionListSchema = z
  .array(aiChatSessionSchema)
  .meta({ id: 'AiChatSessionList' })

/**
 * 发送消息；sessionId 缺省时自动新建会话。
 *
 * 空串按「未指定」处理：前端的「新会话」状态下会传 `""`，而它不能进 SQL。
 */
export const aiChatSendReqSchema = z
  .object({
    sessionId: z
      .string()
      .optional()
      .transform((value) => (value === '' ? undefined : value)),
    content: z.string().trim().min(1).max(100_000),
  })
  .strict()
  .meta({ id: 'AiChatSendReq' })

/**
 * 回复内容；消息暂不落库，只返回模型输出。
 */
export const aiChatSendRespSchema = z
  .object({
    sessionId: z.string(),
    content: z.string(),
  })
  .meta({ id: 'AiChatSendResp' })

export type AiChatSendReq = z.infer<typeof aiChatSendReqSchema>
