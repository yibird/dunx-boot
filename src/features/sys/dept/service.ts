import { CrudService } from '@/infra/crud'
import { sysDept } from '@/schemas'
import { SysDeptRepository } from './repository'

/**
 * 部门业务层
 */
export class SysDeptService extends CrudService<
  typeof sysDept,
  SysDeptRepository
> {
  constructor(override readonly repository: SysDeptRepository) {
    super(repository)
  }
}
