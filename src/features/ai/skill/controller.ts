import { CrudController, CRUD_ENDPOINT } from '@/infra/crud'
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
  includes: [
    CRUD_ENDPOINT.GET_LIST,
    CRUD_ENDPOINT.GET_PAGE_LIST,
    CRUD_ENDPOINT.GET_RECORD,
    CRUD_ENDPOINT.CREATE,
    CRUD_ENDPOINT.UPDATE,
    CRUD_ENDPOINT.DELETE,
  ],
  schema: {
    response: aiSkillSchema,
    create: aiSkillCreateReqSchema,
    update: aiSkillUpdateReqSchema,
    query: aiSkillQuerySchema,
  },
}) {}
