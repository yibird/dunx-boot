import { CrudController } from '@/infra/crud'
import { SysDeptService } from './service'
import { schema } from './schema'

export class SysDeptController extends CrudController({
  service: SysDeptService,
  prefix: 'sys/dept',
  tags: ['部门'],
  modelName: 'SysDept',
  schema,
}) {}
