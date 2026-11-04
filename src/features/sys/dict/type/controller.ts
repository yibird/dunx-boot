import { CrudController } from '@/infra/crud'
import { schema } from './schema'
import { SysDictTypeService } from './service'

export class SysDictTypeController extends CrudController({
  service: SysDictTypeService,
  prefix: 'sys/dict-type',
  tags: ['字典类型'],
  modelName: 'SysDictType',
  schema,
}) {}
