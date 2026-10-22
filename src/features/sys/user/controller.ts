import { CrudController } from '@/infra/crud'
import { SysUserService } from './service'
import {
  sysUserSchema,
  sysUserCreateReqSchema,
  sysUserQuerySchema,
  sysUserUpdateReqSchema,
} from './schema'

export class SysUserController extends CrudController({
  service: SysUserService,
  prefix: 'sys/user',
  tags: ['用户'],
  modelName: 'SysUser',
  schema: {
    response: sysUserSchema,
    create: sysUserCreateReqSchema,
    update: sysUserUpdateReqSchema,
    query: sysUserQuerySchema,
  },
}) {}
