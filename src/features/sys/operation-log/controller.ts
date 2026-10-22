import { CRUD_ENDPOINT, CrudController } from '@/infra/crud'
import {
  SysOperationLogSchema,
  SysOperationLogCreateSchema,
  SysOperationLogQuery,
  SysOperationLogUpdateSchema,
} from './schema'
import { SysOperationLogService } from './service'

export class SysOperationLogController extends CrudController({
  service: SysOperationLogService,
  prefix: 'sys/operation-log',
  tags: ['操作日志'],
  modelName: 'SysOperationLog',
  schema: {
    response: SysOperationLogSchema,
    create: SysOperationLogCreateSchema,
    update: SysOperationLogUpdateSchema,
    query: SysOperationLogQuery,
  },
  includes: [CRUD_ENDPOINT.GET_PAGE_LIST, CRUD_ENDPOINT.GET_RECORD],
}) {}
