import { CrudService } from '@/infra/crud'
import type { SysPostQuery } from './schema'
import { sysPost } from '@/schemas'
import { SysPostRepository } from './repository'

/**
 * 下拉选项一次最多返回多少条。
 */
export const POST_OPTION_LIMIT = 500

/**
 * 岗位业务层
 */
export class SysPostService extends CrudService<
  typeof sysPost,
  never,
  SysPostRepository,
  Partial<SysPostQuery>
> {
  constructor(override readonly repository: SysPostRepository) {
    super(repository)
  }
}
