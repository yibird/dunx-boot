import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { sysPost } from '@/schemas'
import type { SysPostQuery } from './schema'

/**
 * 岗位仓储层
 */
export class SysPostRepository extends CrudRepository<typeof sysPost> {
  constructor() {
    super({
      table: sysPost,
      cache: true,
      defaultOrderBy: [asc(sysPost.postLevel), asc(sysPost.id)],
    })
  }

  override getQueryOptions(query: SysPostQuery) {
    return {
      where: mergeAnd(
        ilikeIf(sysPost.postName, query.postName),
        eqIf(sysPost.postLevel, query.postLevel)
      ),
    }
  }
}
