import { CrudController } from '@/infra/crud'
import {
  sysRoleSchema,
  sysRoleCreateReqSchema,
  sysRoleQuerySchema,
  sysRoleUpdateReqSchema,
} from './schema'
import { SysRoleService } from './service'

export class SysRoleController extends CrudController({
  service: SysRoleService,
  prefix: 'sys/role',
  tags: ['角色'],
  modelName: 'SysRole',
  schema: {
    response: sysRoleSchema,
    create: sysRoleCreateReqSchema,
    update: sysRoleUpdateReqSchema,
    query: sysRoleQuerySchema,
  },
}) {}
