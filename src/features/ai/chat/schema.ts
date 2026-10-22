import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { aiChat, commonColumnsSchema } from '@/schemas'

export const aiChatSchema = createSelectSchema(aiChat, {
  ownerUserId: z.string().nullable().meta({ description: '所有者用户 ID' }),
  agentId: z.string().nullable().meta({ description: 'Agent ID' }),
  modelId: z.string().nullable().meta({ description: '模型 ID' }),
  name: z.string().max(100).meta({ description: 'Chat 名称' }),
  suggestedQuestions: z.array(z.string()).meta({ description: '推荐问题' }),
  config: z.record(z.string(), z.unknown()).meta({ description: '扩展配置' }),
  ...commonColumnsSchema,
}).meta({ id: 'AiChat', description: 'AI Chat 配置' })

export const aiChatSessionCreateReqSchema = z.object({
  title: z.string().meta({ description: '会话标题', examples: ['哈哈'] }),
})

export type AiChatSessionCreateReq = z.infer<
  typeof aiChatSessionCreateReqSchema
>
