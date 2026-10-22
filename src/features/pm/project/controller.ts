import { CrudController } from '@/infra/crud'
import { pmProjectSchema } from '@/schemas'
import {
  pmProjectCreateReqSchema,
  pmProjectQuerySchema,
  pmProjectUpdateReqSchema,
} from './model'
import { PmProjectService } from './service'

/**
 * 项目控制器：九个 CRUD 端点由基类生成
 */
export class PmProjectController extends CrudController({
  service: PmProjectService,
  prefix: 'pm/project',
  tags: ['项目'],
  modelName: 'PmProject',
  schema: {
    response: pmProjectSchema,
    create: pmProjectCreateReqSchema,
    update: pmProjectUpdateReqSchema,
    query: pmProjectQuerySchema,
  },
}) {}
