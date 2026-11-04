import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysDictType } from '@/schemas'

export const sysDictTypeSchema = createSelectSchema(sysDictType, {
  dictKey: (schema) =>
    schema.meta({ description: '字典类型键', examples: ['222'] }),
  dictName: (schema) =>
    schema.meta({ description: '字典类型名称', examples: ['1111'] }),
  ...commonColumnsSchema,
}).meta({ id: 'SysDictType' })

export const sysDictTypeQuerySchema = baseQuerySchema
  .extend({
    dictName: z
      .string()
      .optional()
      .meta({ description: '字典名称（模糊查询）' }),
    dictType: z
      .string()
      .optional()
      .meta({ description: '字典类型（模糊查询）' }),
  })
  .meta({ id: 'SysDictTypeQuery' })
/**
 * 新增入参
 */
export const sysDictTypeCreateReqSchema = createInsertSchema(sysDictType)
  .pick({ dictName: true, dictKey: true, remark: true })
  .meta({ id: 'SysDictTypeCreateReq' })

/**
 * 更新入参（`version` 必填，乐观锁契约）
 */
export const sysDictTypeUpdateReqSchema = createUpdateSchema(sysDictType)
  .pick({ dictName: true, dictKey: true, remark: true })
  .extend({ version: z.number().int().positive() })
  .meta({ id: 'SysDictTypeUpdateReq' })

export type SysDictTypeQuery = z.infer<typeof sysDictTypeQuerySchema>
export type SysDictTypeUpdateReq = z.infer<typeof sysDictTypeUpdateReqSchema>
export type SysDictTypeCreateReq = z.infer<typeof sysDictTypeCreateReqSchema>

export const schema = {
  response: sysDictTypeSchema,
  create: sysDictTypeCreateReqSchema,
  update: sysDictTypeUpdateReqSchema,
  query: sysDictTypeQuerySchema,
}
