import { CrudController } from '@/infra/crud'
import { schema } from './schema'
import { SysDictDataService } from './service'

export class SysDictDataController extends CrudController({
  service: SysDictDataService,
  prefix: 'sys/dict-data',
  tags: ['字典数据'],
  modelName: 'SysDictData',
  schema,
}) {}
