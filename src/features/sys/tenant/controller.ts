import { CrudController } from '@/infra/crud'
import { schema } from './schema'
import { SysTenantService } from './service'

export class SysTenantController extends CrudController({
  service: SysTenantService,
  prefix: 'sys/tenant',
  tags: ['租户'],
  modelName: 'SysTenant',
  schema,
}) {}
