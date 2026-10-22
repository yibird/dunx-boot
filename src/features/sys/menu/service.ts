import { CrudService } from '@/infra/crud'
import { sysMenu } from '@/schemas'
import { SysMenuRepository } from './repository'

export class SysMenuService extends CrudService<
  typeof sysMenu,
  SysMenuRepository
> {
  /**
   * 构造器不能省：零参构造会继承基类的参数记录（`TRepo` 是类型参数 → `unresolved`），
   * 容器会以「cannot be constructed」启动失败。
   */
  // oxlint-disable-next-line no-useless-constructor
  constructor(repository: SysMenuRepository) {
    super(repository)
  }
}
