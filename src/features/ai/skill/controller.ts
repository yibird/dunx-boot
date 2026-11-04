import { CrudController } from '@/infra/crud'
import {
  aiSkillSchema,
  aiSkillCreateReqSchema,
  aiSkillQuerySchema,
  aiSkillUpdateReqSchema,
} from './schema'
import { AiSkillService } from './service'

export class AiSkillController extends CrudController({
  service: AiSkillService,
  prefix: 'ai/skill',
  tags: ['Skill'],
  modelName: 'AiSkill',
  schema: {
    response: aiSkillSchema,
    create: aiSkillCreateReqSchema,
    update: aiSkillUpdateReqSchema,
    query: aiSkillQuerySchema,
  },
}) {}
