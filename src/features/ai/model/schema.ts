import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { aiModel, commonColumnsSchema } from '@/schemas'

export const aiModelSchema = createSelectSchema(aiModel, {
  providerId: z.string().meta({
    description: '模型供应商 ID',
    examples: ['1'],
  }),
  modelKey: z.string().meta({
    description: '模型标识',
    examples: ['gpt-4o'],
  }),
  modelName: z.string().meta({
    description: '模型显示名称',
    examples: ['GPT-4o'],
  }),
  modelType: z.number().meta({
    description: '模型类型',
    examples: ['chat'],
  }),
  contextWindow: z
    .number()
    .int()
    .positive()
    .meta({
      description: '上下文窗口大小（Token）',
      examples: [128000],
    }),
  maxOutputTokens: z
    .number()
    .int()
    .positive()
    .nullable()
    .meta({
      description: '最大输出 Token 数',
      examples: [16384],
    }),
  embeddingDimensions: z
    .number()
    .int()
    .positive()
    .nullable()
    .meta({
      description: '向量维度，仅嵌入模型适用',
      examples: [1536],
    }),
  supportsStreaming: z.boolean().meta({
    description: '是否支持流式输出',
    examples: [true],
  }),
  supportsTools: z.boolean().meta({
    description: '是否支持工具调用',
    examples: [true],
  }),
  supportsVision: z.boolean().meta({
    description: '是否支持视觉输入',
    examples: [true],
  }),
  supportsReasoning: z.boolean().meta({
    description: '是否支持推理能力',
    examples: [false],
  }),
  defaultTemperature: z
    .number()
    .min(0)
    .max(2)
    .meta({
      description: '默认采样温度',
      examples: [0.7],
    }),
  defaultTopP: z
    .number()
    .min(0)
    .max(1)
    .meta({
      description: '默认 Top-P 采样参数',
      examples: [1],
    }),
  inputTokenPrice: z.string().meta({
    description: '输入 Token 单价',
    examples: ['2.5'],
  }),
  outputTokenPrice: z.string().meta({
    description: '输出 Token 单价',
    examples: ['10'],
  }),
  priceUnitTokens: z
    .number()
    .int()
    .positive()
    .meta({
      description: '价格计费 Token 单位',
      examples: [1000000],
    }),
  currency: z
    .string()
    .length(3)
    .meta({
      description: '价格币种（ISO 4217）',
      examples: ['USD'],
    }),
  config: z.record(z.string(), z.unknown()).meta({
    description: '模型扩展配置',
    examples: [{}],
  }),
  ...commonColumnsSchema,
}).meta({
  id: 'AiModel',
})

export const aiModelQuerySchema = baseQuerySchema
  .extend({
    modelType: z
      .number()
      .optional()
      .nullable()
      .meta({ description: '模型类型', examples: [1] }),
    providerId: z
      .number()
      .optional()
      .nullable()
      .meta({ description: '供应商', examples: [1] }),
    modelName: z
      .string()
      .optional()
      .nullable()
      .meta({ description: '模型名称', examples: ['Deepseek'] }),
  })
  .meta({ id: 'AiModelQuery' })

export const aiModelCreateReqSchema = aiModelSchema
  .pick({
    providerId: true,
    modelKey: true,
    modelName: true,
    modelType: true,
    contextWindow: true,
    maxOutputTokens: true,
    embeddingDimensions: true,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsReasoning: true,
    defaultTemperature: true,
    defaultTopP: true,
    inputTokenPrice: true,
    outputTokenPrice: true,
    priceUnitTokens: true,
    currency: true,
    config: true,
  })
  .meta({ id: 'AiModelCreateReq' })

export const aiModelUpdateReqSchema = aiModelCreateReqSchema
  .extend({
    id: aiModelSchema.shape.id,
  })
  .meta({ id: 'AiModelUpdateReq' })

export type AiModelQuery = z.infer<typeof aiModelQuerySchema>
export type AiModelCreateReq = z.infer<typeof aiModelCreateReqSchema>
export type AiModelUpdateReq = z.infer<typeof aiModelUpdateReqSchema>
