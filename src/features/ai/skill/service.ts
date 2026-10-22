import { CrudService } from '@/infra/crud'
import { aiSkill } from '@/schemas'
import { AiSkillRepository } from './repository'

export class AiSkillService extends CrudService<
  typeof aiSkill,
  AiSkillRepository
> {
  constructor(protected override readonly repository: AiSkillRepository) {
    super(repository)
  }
}
