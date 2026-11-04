import { CrudService } from '@/infra/crud'
import type { SysRoleQuery } from './schema'
import { sysRole } from '@/schemas'
import { SysRoleRepository } from './repository'

/**
 * 角色业务层
 */
export class SysRoleService extends CrudService<
  typeof sysRole,
  never,
  SysRoleRepository,
  Partial<SysRoleQuery>
> {
  constructor(override readonly repository: SysRoleRepository) {
    super(repository)
  }
}
