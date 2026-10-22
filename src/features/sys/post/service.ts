import { CrudService } from '@/infra/crud'
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
  SysPostRepository
> {
  constructor(override readonly repository: SysPostRepository) {
    super(repository)
  }
}
