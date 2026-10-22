import { CrudController, CRUD_ENDPOINT } from '@/infra/crud'
import {
  aiModelProviderSchema,
  aiModelProviderQuerySchema,
  aiModelProviderCreateReqSchema,
  aiModelProviderUpdateReqSchema,
} from './schema'
import { AiModelProviderService } from './service'

export class AiModelProviderController extends CrudController({
  service: AiModelProviderService,
  prefix: 'ai/modelProvider',
  tags: ['Model Privoder'],
  modelName: 'AiModelProvider',
  includes: [
    CRUD_ENDPOINT.GET_LIST,
    CRUD_ENDPOINT.GET_PAGE_LIST,
    CRUD_ENDPOINT.GET_RECORD,
    CRUD_ENDPOINT.CREATE,
    CRUD_ENDPOINT.UPDATE,
    CRUD_ENDPOINT.DELETE,
  ],
  schema: {
    response: aiModelProviderSchema,
    create: aiModelProviderCreateReqSchema,
    update: aiModelProviderUpdateReqSchema,
    query: aiModelProviderQuerySchema,
  },
}) {}
