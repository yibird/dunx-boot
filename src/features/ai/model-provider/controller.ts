import { CrudController } from '@/infra/crud'
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
  schema: {
    response: aiModelProviderSchema,
    create: aiModelProviderCreateReqSchema,
    update: aiModelProviderUpdateReqSchema,
    query: aiModelProviderQuerySchema,
  },
}) {}
