import { CrudController } from '@/infra/crud'
import {
  sysTenantSchema,
  sysTenantCreateReqSchema,
  sysTenantQuerySchema,
  sysTenantUpdateReqSchema,
} from './schema'
import { SysTenantService } from './service'

export class SysTenantController extends CrudController({
  service: SysTenantService,
  prefix: 'sys/tenant',
  tags: ['租户'],
  modelName: 'SysTenant',
  schema: {
    response: sysTenantSchema,
    create: sysTenantCreateReqSchema,
    update: sysTenantUpdateReqSchema,
    query: sysTenantQuerySchema,
  },
}) {}
