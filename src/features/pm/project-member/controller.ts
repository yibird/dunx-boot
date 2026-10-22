import { CrudController } from '@/infra/crud'
import { pmProjectMemberSchema } from '@/schemas'
import {
  pmProjectMemberCreateReqSchema,
  pmProjectMemberQuerySchema,
  pmProjectMemberUpdateReqSchema,
} from './model'
import { PmProjectMemberService } from './service'

/**
 * 项目成员控制器：九个 CRUD 端点由基类生成
 */
export class PmProjectMemberController extends CrudController({
  service: PmProjectMemberService,
  prefix: 'pm/project-member',
  tags: ['项目成员'],
  modelName: 'PmProjectMember',
  schema: {
    response: pmProjectMemberSchema,
    create: pmProjectMemberCreateReqSchema,
    update: pmProjectMemberUpdateReqSchema,
    query: pmProjectMemberQuerySchema,
  },
}) {}
