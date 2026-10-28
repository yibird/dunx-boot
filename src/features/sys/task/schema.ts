import { commonColumnsSchema, sysTask } from '@/schemas'
import { createSelectSchema } from 'drizzle-orm/zod'

export const sysTaskSchema = createSelectSchema(sysTask, {
  ...commonColumnsSchema,
}).meta({ id: 'SysTask' })
