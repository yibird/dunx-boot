import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { boolean, integer, varchar } from 'drizzle-orm/pg-core'
import { DEFAULT_TENANT_ID } from '@/constants'
import { bigintString, bigserialString, datetime } from './types'

export const idField = () =>
  z
    .unknown()
    .transform((val) => String(val as bigint | number | string))
    .pipe(z.string())

/**
 * 表通用列字段集合
 */
export const commonColumns = {
  id: bigserialString('id').primaryKey(),
  tenantId: bigintString('tenant_id').default(DEFAULT_TENANT_ID).notNull(),
  dataStatus: boolean('data_status').default(true).notNull(),
  remark: varchar('remark', { length: 500 }),
  version: integer('version').default(1).notNull(),
  sort: integer('sort').default(0).notNull(),
  deleted: boolean('deleted').default(false).notNull(),
  createBy: bigintString('create_by'),
  createdAt: datetime('create_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  creatorName: varchar('creator_name', { length: 64 }).default(''),
  updateBy: bigintString('update_by'),
  updatedAt: datetime('update_at'),
  updaterName: varchar('updater_name', { length: 50 }).default(''),
  deleteBy: bigintString('delete_by'),
  deletedAt: datetime('deleted_at'),
  deleterName: varchar('deleter_name', { length: 64 }),
}

/**
 * 表通用列Schema集合
 */
export const commonColumnsSchema = {
  id: z.string().meta({ description: 'id', examples: ['1'] }),
  tenantId: z
    .string()
    .meta({ description: '租户id，默认 1（默认租户）', examples: ['1'] }),
  dataStatus: z.boolean().meta({
    description: '数据状态：false 表示禁用，true 表示启用',
    examples: [true, false],
  }),
  remark: z
    .string()
    .nullable()
    .meta({
      description: '备注',
      examples: ['备注信息'],
    }),
  version: z
    .number()
    .int()
    .meta({
      description: '乐观锁版本号',
      examples: [1, 2],
    }),
  sort: z.number().int().meta({ description: '排序序号', example: 0 }),
  deleted: z.boolean().meta({
    description: '逻辑删除标志',
    examples: [false, true],
  }),
  createBy: z
    .string()
    .nullable()
    .meta({
      description: '创建人主键',
      examples: ['1001'],
    }),
  createdAt: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({
      description: '创建时间',
      examples: ['2026-07-20 17:39:30'],
    }),
  creatorName: z
    .string()
    .nullable()
    .meta({
      description: '创建人名称',
      examples: ['admin'],
    }),
  updateBy: z
    .string()
    .nullable()
    .meta({
      description: '更新人主键',
      examples: ['1001'],
    }),
  updatedAt: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({
      description: '更新时间',
      examples: ['2026-07-20 17:39:30'],
    }),
  updaterName: z
    .string()
    .nullable()
    .meta({
      description: '更新人名称',
      examples: ['admin'],
    }),
  deleteBy: z
    .string()
    .nullable()
    .meta({
      description: '删除人主键',
      examples: ['1001'],
    }),
  deletedAt: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({
      description: '删除时间',
      examples: ['2026-07-20 17:39:30'],
    }),
  deleterName: z
    .string()
    .nullable()
    .meta({
      description: '删除人名称',
      examples: ['admin'],
    }),
}
