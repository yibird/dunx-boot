import { CrudController } from '@/infra/crud'
import { SysDeptService } from './service'
import {
  sysDeptSchema,
  SysDeptCreateReqSchema,
  SysDeptQuerySchema,
  SysDeptUpdateReqSchema,
} from './model'

export class SysDeptController extends CrudController({
  service: SysDeptService,
  prefix: 'sys/dept',
  tags: ['部门'],
  modelName: 'SysDept',
  schema: {
    response: sysDeptSchema,
    create: SysDeptCreateReqSchema,
    update: SysDeptUpdateReqSchema,
    query: SysDeptQuerySchema,
  },
}) {}
