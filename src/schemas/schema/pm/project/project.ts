import { sql } from 'drizzle-orm'
import {
  index,
  pgTable,
  smallint,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { commonColumns, commonColumnsSchema } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'
import { PM_PROJECT_PRIORITY, PM_PROJECT_STATUS } from '@/constants'

/**
 * 项目基本信息表
 */
export const pmProject = pgTable(
  'pm_project',
  {
    /**
     * 项目名称。
     */
    projectName: varchar('project_name', { length: 200 }).notNull(),
    /**
     * 项目编号，租户内唯一；为空时不做唯一约束。
     */
    projectCode: varchar('project_code', { length: 64 }),
    /**
     * 项目描述。
     */
    description: text('description'),
    /**
     * 项目状态：1 未开始 2 进行中 3 已完成 4 已归档 5 已取消。
     */
    status: smallint('status').default(PM_PROJECT_STATUS.NotStarted).notNull(),
    /**
     * 项目优先级：1 低 2 中 3 高。
     */
    priority: smallint('priority')
      .default(PM_PROJECT_PRIORITY.Medium)
      .notNull(),
    /**
     * 项目负责人。
     */
    ownerId: bigintString('owner_id'),
    /**
     * 计划开始时间。
     */
    startDate: datetime('start_date'),
    /**
     * 计划结束时间。
     */
    endDate: datetime('end_date'),
    ...commonColumns,
  },
  (table) => [
    index('pm_project_owner_idx').on(table.ownerId),
    uniqueIndex('pm_project_code_uidx')
      .on(table.tenantId, table.projectCode)
      .where(
        sql`${table.deleted} = false AND ${table.projectCode} IS NOT NULL`
      ),
  ]
)

export const pmProjectSchema = createSelectSchema(pmProject, {
  projectName: z
    .string()
    .meta({ description: '项目名称', examples: ['客户门户改版'] }),
  projectCode: z
    .string()
    .nullable()
    .meta({ description: '项目编号（租户内唯一）', examples: ['PM-2026-001'] }),
  description: z
    .string()
    .nullable()
    .meta({ description: '项目描述', examples: ['门户前台改版'] }),
  status: z
    .union([
      z.literal(PM_PROJECT_STATUS.NotStarted),
      z.literal(PM_PROJECT_STATUS.InProgress),
      z.literal(PM_PROJECT_STATUS.Completed),
      z.literal(PM_PROJECT_STATUS.Archived),
      z.literal(PM_PROJECT_STATUS.Canceled),
    ])
    .meta({
      description: '项目状态：1 未开始 2 进行中 3 已完成 4 已归档 5 已取消',
      examples: [PM_PROJECT_STATUS.NotStarted],
    }),
  priority: z
    .union([
      z.literal(PM_PROJECT_PRIORITY.Low),
      z.literal(PM_PROJECT_PRIORITY.Medium),
      z.literal(PM_PROJECT_PRIORITY.High),
    ])
    .meta({
      description: '项目优先级：1 低 2 中 3 高',
      examples: [PM_PROJECT_PRIORITY.Medium],
    }),
  ownerId: z
    .string()
    .nullable()
    .meta({ description: '项目负责人', examples: ['1'] }),
  startDate: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({ description: '计划开始时间', examples: ['2026-07-20 00:00:00'] }),
  endDate: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({ description: '计划结束时间', examples: ['2026-08-20 00:00:00'] }),
  ...commonColumnsSchema,
}).meta({ id: 'PmProject' })

export type PmProjectTable = typeof pmProject
export type PmProject = typeof pmProject.$inferSelect
export type PmProjectInsert = typeof pmProject.$inferInsert
