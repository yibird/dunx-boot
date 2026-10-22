import { CrudService } from '@/infra/crud'
import { sysOperationLog } from '@/schemas'
import { SysOperationLogRepository } from './repository'

/**
 * 操作日志业务层
 */
export class SysOperationLogService extends CrudService<
  typeof sysOperationLog,
  SysOperationLogRepository
> {
  /**
   * 构造器不能省：零参构造会继承基类的参数记录（`TRepo` 是类型参数 → `unresolved`），
   * 容器会以「cannot be constructed」启动失败。
   */
  // oxlint-disable-next-line no-useless-constructor
  constructor(repository: SysOperationLogRepository) {
    super(repository)
  }
}
