import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { sysPost } from '@/schemas'

export class SysPostRepository extends CrudRepository<typeof sysPost> {
  constructor() {
    super({
      table: sysPost,
      queryOptions: {
        orderBy: [asc(sysPost.postLevel), asc(sysPost.id)],
      },
    })
  }
}
