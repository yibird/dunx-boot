import { CrudController, CRUD_ENDPOINT } from '@/infra/crud'
import {
  aiModelSchema,
  aiModelQuerySchema,
  aiModelCreateReqSchema,
  aiModelUpdateReqSchema,
} from './schema'
import { AiModelService } from './service'

export class AiModelController extends CrudController({
  service: AiModelService,
  prefix: 'ai/model',
  tags: ['Model'],
  modelName: 'AiModel',
  includes: [
    CRUD_ENDPOINT.GET_LIST,
    CRUD_ENDPOINT.GET_PAGE_LIST,
    CRUD_ENDPOINT.GET_RECORD,
    CRUD_ENDPOINT.CREATE,
    CRUD_ENDPOINT.UPDATE,
    CRUD_ENDPOINT.DELETE,
  ],
  schema: {
    response: aiModelSchema,
    create: aiModelCreateReqSchema,
    update: aiModelUpdateReqSchema,
    query: aiModelQuerySchema,
  },
}) {}
