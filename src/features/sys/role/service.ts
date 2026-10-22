import { CrudService } from '@/infra/crud'
import { sysRole } from '@/schemas'
import { SysRoleRepository } from './repository'

/**
 * 角色业务层
 */
export class SysRoleService extends CrudService<
  typeof sysRole,
  SysRoleRepository
> {
  constructor(override readonly repository: SysRoleRepository) {
    super(repository)
  }
}
