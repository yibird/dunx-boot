import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { commonColumnsSchema, sysDictData } from '@/schemas'
import { baseQuerySchema } from '@/infra/model'

export const sysDictDataSchema = createSelectSchema(sysDictData, {
  dictTypeId: (schema) =>
    schema.meta({ description: '字典类型ID', examples: ['1'] }),
  dictLabel: (schema) =>
    schema.meta({ description: '字典标签', examples: ['正常'] }),
  dictValue: (schema) =>
    schema.meta({ description: '字典值', examples: ['1'] }),
  ...commonColumnsSchema,
}).meta({ id: 'SysDictData' })

export const sysDictDataQuerySchema = baseQuerySchema.extend({
  dictTypeId: z.string().optional(),
  dictLabel: z.string().optional(),
  dictValue: z.string().optional(),
})

export const sysDictDataCreateReqSchema = sysDictDataSchema.omit({
  dictTypeId: true,
  dictLabel: true,
  dictValue: true,
  dataStatus: true,
})

export const sysDictDataUpdateReqSchema = sysDictDataSchema.omit({
  dictTypeId: true,
  dictLabel: true,
  dictValue: true,
  dataStatus: true,
})

export type SysDictData = z.infer<typeof sysDictDataSchema>
export type SysDictDataQuery = z.infer<typeof sysDictDataQuerySchema>
export type SysDictDataCreateReq = z.infer<typeof sysDictDataCreateReqSchema>
export type SysDictDataUpdateReq = z.infer<typeof sysDictDataUpdateReqSchema>

export const schema = {
  response: sysDictDataSchema,
  create: sysDictDataCreateReqSchema,
  update: sysDictDataUpdateReqSchema,
  query: sysDictDataQuerySchema,
}
