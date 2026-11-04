import { CrudController } from '@/infra/crud'
import { schema } from './schema'
import { SysRoleService } from './service'

export class SysRoleController extends CrudController({
  service: SysRoleService,
  prefix: 'sys/role',
  tags: ['角色'],
  modelName: 'SysRole',
  schema,
}) {}
