import { CrudService } from '@/infra/crud'
import type { PmProjectQuery } from './model'
import { pmProject } from '@/schemas'
import { PmProjectRepository } from './repository'

/**
 * 项目业务层
 */
export class PmProjectService extends CrudService<
  typeof pmProject,
  never,
  PmProjectRepository,
  Partial<PmProjectQuery>
> {
  constructor(override readonly repository: PmProjectRepository) {
    super(repository)
  }
}
