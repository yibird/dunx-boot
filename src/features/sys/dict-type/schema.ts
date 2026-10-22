import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysDictData, sysDictType } from '@/schemas'

export const SysDictTypeSchema = createSelectSchema(sysDictType, {
  dictName: z.string().meta({ description: '字段名称', examples: ['1111'] }),
  dictType: z.string().meta({ description: '字段类型', examples: ['222'] }),
  ...commonColumnsSchema,
}).meta({ id: 'SysDictType' })

export const sysDictDataSchema = createSelectSchema(sysDictData, {
  ...commonColumnsSchema,
}).meta({ id: 'SysDictData' })

/**
 * 新增入参
 */
export const SysDictTypeCreateReq = createInsertSchema(sysDictType)
  .pick({ dictName: true, dictType: true, remark: true })
  .meta({ id: 'SysDictTypeCreateReq' })
export type SysDictTypeCreateReq = z.infer<typeof SysDictTypeCreateReq>

/**
 * 更新入参（`version` 必填，乐观锁契约）
 */
export const SysDictTypeUpdateReq = createUpdateSchema(sysDictType)
  .pick({ dictName: true, dictType: true, remark: true })
  .extend({ version: z.number().int().positive() })
  .meta({ id: 'SysDictTypeUpdateReq' })
export type SysDictTypeUpdateReq = z.infer<typeof SysDictTypeUpdateReq>

export const SysDictTypeQuery = baseQuerySchema
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
export type SysDictTypeQuery = z.infer<typeof SysDictTypeQuery>
