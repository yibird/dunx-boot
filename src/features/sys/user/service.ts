import { CrudService } from '@/infra/crud'
import { SysUserRepository } from './repository'
import { sysUser } from '@/schemas'

export class SysUserService extends CrudService<
  typeof sysUser,
  SysUserRepository
> {
  constructor(override readonly repository: SysUserRepository) {
    super(repository)
  }
}
