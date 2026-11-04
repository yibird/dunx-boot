import { CrudController } from '@/infra/crud'
import { pmProjectMemberSchema } from '@/schemas'
import {
  pmProjectMemberCreateReqSchema,
  pmProjectMemberQuerySchema,
  pmProjectMemberUpdateReqSchema,
} from './model'
import { PmProjectMemberService } from './service'

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
