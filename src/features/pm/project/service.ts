import { CrudService } from '@/infra/crud'
import { pmProject } from '@/schemas'
import { PmProjectRepository } from './repository'

/**
 * 项目业务层
 */
export class PmProjectService extends CrudService<
  typeof pmProject,
  PmProjectRepository
> {
  constructor(override readonly repository: PmProjectRepository) {
    super(repository)
  }
}
