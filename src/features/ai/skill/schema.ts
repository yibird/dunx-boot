import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { aiSkill, commonColumnsSchema } from '@/schemas'
import { POSTGRES_INTEGER_MAX } from '../chat/constant'

export const aiSkillSchema = createSelectSchema(aiSkill, {
  ownerUserId: z.string().meta({ description: '所有者用户 ID' }),
  name: z.string().max(100).meta({ description: '技能名称' }),
  description: z.string().max(500).nullable().meta({ description: '技能描述' }),
  content: z.string().meta({ description: 'Markdown 技能指令' }),
  visibility: z
    .enum(['private', 'public'])
    .meta({ description: '同租户内的使用可见性' }),
  ...commonColumnsSchema,
}).meta({ id: 'AiSkill', description: 'AI 技能' })

/**
 * Skill 的内容是 Markdown 指令，不能由客户端指定归属和审计字段。
 */
const aiSkillWriteSchema = aiSkillSchema
  .pick({
    name: true,
    description: true,
    content: true,
    visibility: true,
    dataStatus: true,
    remark: true,
    sort: true,
  })
  .extend({
    name: z.string().trim().min(1).max(100),
    description: z.string().max(500).nullable(),
    content: z
      .string()
      .min(1)
      .max(50_000)
      .refine((value) => value.trim().length > 0, {
        message: '技能指令不能为空',
      }),
    visibility: z.enum(['private', 'public']),
    remark: z.string().max(500).nullable(),
    sort: z
      .number()
      .int()
      .min(-POSTGRES_INTEGER_MAX - 1)
      .max(POSTGRES_INTEGER_MAX),
  })
  .strict()

export const aiSkillCreateReqSchema = aiSkillWriteSchema
  .partial()
  .required({ name: true, content: true })
  .meta({ id: 'AiSkillCreateReq' })

export const aiSkillUpdateReqSchema = aiSkillWriteSchema
  .partial()
  .extend({
    version: z.number().int().positive().max(POSTGRES_INTEGER_MAX).optional(),
  })
  .meta({ id: 'AiSkillUpdateReq' })

export const aiSkillQuerySchema = baseQuerySchema
  .extend({
    name: z.string().trim().max(100).optional(),
    visibility: z.enum(['private', 'public']).optional(),
    dataStatus: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
  })
  .meta({ id: 'AiSkillQuery' })

export const aiSkillAvailableQuerySchema = baseQuerySchema
  .extend({ name: z.string().trim().max(100).optional() })
  .meta({ id: 'AiSkillAvailableQuery' })

export const aiSkillOptionSchema = aiSkillSchema
  .pick({
    id: true,
    name: true,
    description: true,
    visibility: true,
    ownerUserId: true,
  })
  .meta({ id: 'AiSkillOption' })

export const aiSkillIdSchema = z.string()
export type AiSkillQuery = z.infer<typeof aiSkillQuerySchema>
export type AiSkillAvailableQuery = z.infer<typeof aiSkillAvailableQuerySchema>
