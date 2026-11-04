import { CrudService } from '@/infra/crud'
import { sysDept } from '@/schemas'
import { SysDeptRepository } from './repository'
import type { SysDeptQuery } from './schema'

export class SysDeptService extends CrudService<
  typeof sysDept,
  never,
  SysDeptRepository,
  Partial<SysDeptQuery>
> {
  constructor(override readonly repository: SysDeptRepository) {
    super(repository)
  }
}
