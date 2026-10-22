import { CrudService } from '@/infra/crud'
import { pmProjectMember } from '@/schemas'
import { PmProjectMemberRepository } from './repository'

/**
 * 项目成员业务层
 */
export class PmProjectMemberService extends CrudService<
  typeof pmProjectMember,
  PmProjectMemberRepository
> {
  constructor(override readonly repository: PmProjectMemberRepository) {
    super(repository)
  }
}
