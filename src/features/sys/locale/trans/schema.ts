import { z } from 'zod'
import { sysLocaleTrans } from '@/schemas'
import { createSelectSchema } from 'drizzle-orm/zod'
import { commonColumnsSchema } from '@/schemas'

export const sysLocaleTransSchema = createSelectSchema(sysLocaleTrans, {
  langId: (schema) => schema.meta({ id: '语言ID', examples: ['en'] }),
  namespace: (schema) => schema.meta({ id: '命名空间', examples: ['sys'] }),
  key: (schema) => schema.meta({ id: '键', examples: ['hello'] }),
  value: (schema) => schema.meta({ id: '值', examples: ['hello'] }),
  ...commonColumnsSchema,
}).meta({ id: 'SysLocaleTrans' })

export const sysLocaleTransQuerySchema = z
  .object({
    langId: z
      .string()
      .optional()
      .meta({ id: '语言ID', examples: ['en'] }),
    namespace: z
      .string()
      .optional()
      .meta({ id: '命名空间', examples: ['sys'] }),
    key: z
      .string()
      .optional()
      .meta({ id: '键', examples: ['hello'] }),
  })
  .meta({ id: 'SysLocaleTransQuery' })

export type SysLocaleTrans = z.infer<typeof sysLocaleTransSchema>
export type SysLocaleTransQuery = z.infer<typeof sysLocaleTransQuerySchema>
