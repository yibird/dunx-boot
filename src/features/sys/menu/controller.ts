import { CrudController } from '@/infra/crud'
import { schema } from './schema'
import { SysMenuService } from './service'

export class SysMenuController extends CrudController({
  service: SysMenuService,
  prefix: 'sys/menu',
  tags: ['菜单'],
  modelName: 'SysMenu',
  schema,
}) {}
