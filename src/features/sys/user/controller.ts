import { CrudController } from '@/infra/crud'
import { SysUserService } from './service'
import { schema } from './schema'

export class SysUserController extends CrudController({
  service: SysUserService,
  prefix: 'sys/user',
  tags: ['用户'],
  modelName: 'SysUser',
  schema,
}) {}
