import { CrudService } from '@/infra/crud'
import type { AiSkillQuery } from './schema'
import { aiSkill } from '@/schemas'
import { AiSkillRepository } from './repository'

export class AiSkillService extends CrudService<
  typeof aiSkill,
  never,
  AiSkillRepository,
  Partial<AiSkillQuery>
> {
  constructor(protected override readonly repository: AiSkillRepository) {
    super(repository)
  }
}
