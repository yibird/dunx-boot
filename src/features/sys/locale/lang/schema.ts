import { z } from 'zod'
import { sysLocaleLang } from '@/schemas'
import { createSelectSchema } from 'drizzle-orm/zod'
import { commonColumnsSchema } from '@/schemas'

export const sysLocaleLangSchema = createSelectSchema(sysLocaleLang, {
  langCode: (schema) => schema.meta({ id: '语言编码', examples: ['en'] }),
  langName: (schema) => schema.meta({ id: '语言名称', examples: ['English'] }),
  isDefault: (schema) => schema.meta({ id: '是否默认', examples: [false] }),
  nativeName: (schema) =>
    schema.meta({ id: '本地名称', examples: ['简体中文'] }),
  ...commonColumnsSchema,
}).meta({ id: 'SysLocaleLang' })

export const sysLocaleLangQuerySchema = z.object({
  langCode: z
    .string()
    .optional()
    .meta({ id: '语言编码', examples: ['en'] }),
  langName: z
    .string()
    .optional()
    .meta({ id: '语言名称', examples: ['English'] }),
  isDefault: z
    .boolean()
    .optional()
    .meta({ id: '是否默认', examples: [false] }),
  nativeName: z
    .string()
    .optional()
    .meta({ id: '本地名称', examples: ['简体中文'] }),
})

export type SysLocaleLang = z.infer<typeof sysLocaleLangSchema>
export type SysLocaleLangQuery = z.infer<typeof sysLocaleLangQuerySchema>
