import { CrudService } from '@/infra/crud'
import type { PmProjectMemberQuery } from './model'
import { pmProjectMember } from '@/schemas'
import { PmProjectMemberRepository } from './repository'

/**
 * 项目成员业务层
 */
export class PmProjectMemberService extends CrudService<
  typeof pmProjectMember,
  never,
  PmProjectMemberRepository,
  Partial<PmProjectMemberQuery>
> {
  constructor(override readonly repository: PmProjectMemberRepository) {
    super(repository)
  }
}
