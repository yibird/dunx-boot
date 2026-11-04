import { CrudController } from '@/infra/crud'
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
  schema: {
    response: aiModelSchema,
    create: aiModelCreateReqSchema,
    update: aiModelUpdateReqSchema,
    query: aiModelQuerySchema,
  },
}) {}
