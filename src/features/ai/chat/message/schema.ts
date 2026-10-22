import { createSelectSchema } from 'drizzle-orm/zod'
import { z } from 'zod'
import { aiChatMessage } from '@/schemas'
import { commonColumnsSchema } from '@/schemas/common'

export const aiChatMessageSchema = createSelectSchema(aiChatMessage, {
  sessionId: z.string(),
  parentId: z.string().nullable(),
  userId: z.string().nullable(),
  modelId: z.string().nullable(),
  parts: z.array(z.record(z.string(), z.unknown())),
  ...commonColumnsSchema,
}).meta({ id: 'AiChatMessage' })
