import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { aiModelProvider, commonColumnsSchema } from '@/schemas'

export const aiModelProviderSchema = createSelectSchema(aiModelProvider, {
  providerCode: z
    .string()
    .meta({ description: '供应商编码', examples: ['0001'] }),
  providerName: z
    .string()
    .meta({ description: '供应商名称', examples: ['Deepseek'] }),
  ...commonColumnsSchema,
})

export const aiModelProviderQuerySchema = baseQuerySchema
  .extend({
    providerCode: z
      .string()
      .optional()
      .nullable()
      .meta({ description: '供应商编码', examples: ['0001'] }),
    providerName: z
      .string()
      .optional()
      .nullable()
      .meta({ description: '供应商名称', examples: ['Deepseek'] }),
  })
  .meta({ id: 'AiModelProviderQuery' })

export const aiModelProviderCreateReqSchema = aiModelProviderSchema
  .pick({
    providerCode: true,
    providerName: true,
    remark: true,
  })
  .meta({ id: 'AiModelProviderCreateReq' })

export const aiModelProviderUpdateReqSchema = aiModelProviderCreateReqSchema
  .extend({
    id: aiModelProviderSchema.shape.id,
  })
  .meta({ id: 'AiModelProviderUpdateReq' })

export type AiModelProviderQuery = z.infer<typeof aiModelProviderQuerySchema>
export type AiModelProviderCreateReq = z.infer<
  typeof aiModelProviderCreateReqSchema
>
export type AiModelProviderUpdateReq = z.infer<
  typeof aiModelProviderUpdateReqSchema
>
