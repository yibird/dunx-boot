import { CrudService } from '@/infra/crud'
import { sysDictType } from '@/schemas'
import { SysDictTypeRepository } from './repository'

/**
 * 字典类型业务层：只做查询翻译，其余全部由 {@link CrudService} 提供。
 */
export class SysDictTypeService extends CrudService<
  typeof sysDictType,
  SysDictTypeRepository
> {
  /**
   * 构造器不能省：零参构造会继承基类的参数记录（`TRepo` 是类型参数 → `unresolved`），
   * 容器会以「cannot be constructed」启动失败。
   */
  // oxlint-disable-next-line no-useless-constructor
  constructor(repository: SysDictTypeRepository) {
    super(repository)
  }
}
