import { CrudController } from '@/infra/crud'
import {
  SysDictTypeSchema,
  SysDictTypeCreateReq,
  SysDictTypeQuery,
  SysDictTypeUpdateReq,
} from './schema'
import { SysDictTypeService } from './service'

/**
 * 字典类型控制器：标准域只需要"服务 + 四个 schema"，自有端点写成方法即可
 */
export class SysDictTypeController extends CrudController({
  service: SysDictTypeService,
  prefix: 'sys/dict-type',
  tags: ['字典类型'],
  modelName: 'SysDictType',
  schema: {
    response: SysDictTypeSchema,
    create: SysDictTypeCreateReq,
    update: SysDictTypeUpdateReq,
    query: SysDictTypeQuery,
  },
}) {}
