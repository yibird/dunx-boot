import { CrudController } from '@/infra/crud'
import {
  sysPostSchema,
  sysPostCreateReqSchema,
  sysPostUpdateReqSchema,
  sysPostQuerySchema,
} from './schema'
import { SysPostService } from './service'

export class SysPostController extends CrudController({
  service: SysPostService,
  prefix: 'sys/post',
  tags: ['岗位'],
  modelName: 'SysPost',
  schema: {
    response: sysPostSchema,
    create: sysPostCreateReqSchema,
    update: sysPostUpdateReqSchema,
    query: sysPostQuerySchema,
  },
}) {}
