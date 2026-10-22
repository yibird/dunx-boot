import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { POSTGRES_INTEGER_MAX } from '../chat/constant'
import { aiAgent, commonColumnsSchema } from '@/schemas'

export const MAX_AGENT_SKILLS = 50

export const aiAgentSchema = createSelectSchema(aiAgent, {
  ownerUserId: z.string().nullable().meta({ description: '所有者用户 ID' }),
  modelId: z.string().nullable().meta({ description: '模型 ID' }),
  suggestedQuestions: z.array(z.string()),
  config: z.record(z.string(), z.unknown()),
  ...commonColumnsSchema,
}).meta({ id: 'AiAgent', description: 'AI Agent 配置' })

/**
 * 技能顺序即加载顺序；拒绝重复主键，避免同一指令被多次加载。
 */
export const aiAgentSkillIdsSchema = z
  .array(z.string())
  .max(MAX_AGENT_SKILLS)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: '技能 ID 不能重复',
  })

const aiAgentWriteSchema = aiAgentSchema
  .pick({
    name: true,
    description: true,
    icon: true,
    modelId: true,
    visibility: true,
    systemPrompt: true,
    welcomeMessage: true,
    suggestedQuestions: true,
    temperature: true,
    topP: true,
    maxOutputTokens: true,
    memoryEnabled: true,
    config: true,
    dataStatus: true,
    remark: true,
    sort: true,
  })
  .extend({
    name: z.string().trim().min(1).max(100),
    description: z.string().max(500).nullable(),
    icon: z.string().max(255).nullable(),
    modelId: z.string().nullable(),
    visibility: z.enum(['private', 'public']),
    systemPrompt: z.string().max(100_000),
    welcomeMessage: z.string().max(10_000).nullable(),
    suggestedQuestions: z.array(z.string().max(1000)).max(20),
    temperature: z.number().min(0).max(2),
    topP: z.number().min(0).max(1),
    maxOutputTokens: z
      .number()
      .int()
      .positive()
      .max(POSTGRES_INTEGER_MAX)
      .nullable(),
    sort: z
      .number()
      .int()
      .min(-POSTGRES_INTEGER_MAX - 1)
      .max(POSTGRES_INTEGER_MAX),
    remark: z.string().max(500).nullable(),
    skillIds: aiAgentSkillIdsSchema,
  })
  .strict()

export const aiAgentCreateReqSchema = aiAgentWriteSchema
  .partial()
  .required({ name: true })
  .extend({
    systemPrompt: z.string().max(100_000).default(''),
    skillIds: aiAgentSkillIdsSchema.default([]),
  })
  .meta({ id: 'AiAgentCreateReq' })

export const aiAgentUpdateReqSchema = aiAgentWriteSchema
  .partial()
  .extend({
    version: z.number().int().positive().max(POSTGRES_INTEGER_MAX).optional(),
  })
  .refine(
    (value) =>
      Object.keys(value).some((key) => key !== 'version' && key !== 'id'),
    {
      message: '至少提供一个需要修改的字段',
    }
  )
  .meta({ id: 'AiAgentUpdateReq' })

export const aiAgentQuerySchema = baseQuerySchema
  .extend({
    name: z.string().trim().max(100).optional(),
    modelId: z.string().optional(),
    visibility: z.enum(['private', 'public']).optional(),
    dataStatus: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
  })
  .meta({ id: 'AiAgentQuery' })

export const aiAgentRecordSchema = z.object({ id: z.string() }).strict()
export const aiAgentUpdateBodySchema = aiAgentUpdateReqSchema.safeExtend({
  id: z.string(),
})
export const aiAgentResponseSchema = aiAgentSchema
  .extend({
    skillIds: z
      .array(z.string())
      .meta({ description: '按使用顺序排列的技能 ID' }),
  })
  .meta({ id: 'AiAgentWithSkills' })

export type AiAgentCreateReq = z.infer<typeof aiAgentCreateReqSchema>
export type AiAgentUpdateReq = z.infer<typeof aiAgentUpdateReqSchema>
export type AiAgentQuery = z.infer<typeof aiAgentQuerySchema>
