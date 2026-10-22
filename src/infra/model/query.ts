import { z } from 'zod'

/**
 * 主键id schema
 */
export const IdSchema = z.object({
  id: z.string().meta({
    description: '主键id',
    examples: ['1001'],
  }),
})

/**
 * 创建统一的更新请求 schema，要求包含主键及至少一个更新字段。
 *
 * @param shape 可修改的业务字段定义
 * @return 包含必填 id 的更新请求 schema
 */
export function createUpdateSchema<TShape extends z.ZodRawShape>(
  shape: TShape
) {
  return z
    .object(shape)
    .partial()
    .extend({ id: IdSchema.shape.id })
    .refine((data) => Object.keys(data).some((key) => key !== 'id'), {
      message: '至少提供一个需要修改的字段',
    })
}

/**
 * 分页查询参数 schema
 */
export const baseQuerySchema = z.object({
  current: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .meta({
      description: '当前页码',
      examples: [1],
    }),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(1000)
    .default(10)
    .meta({
      description: '每页条数',
      examples: [10],
    }),
})

export type Id = z.infer<typeof IdSchema>
export type BaseQuery = z.infer<typeof baseQuerySchema>
