import { and, desc, eq } from 'drizzle-orm'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { CrudRepository } from '@/infra/crud'
import { sysNotice, sysNoticeRead } from '@/schemas'

/**
 * 通知公告仓储
 */
export class SysNoticeRepository extends CrudRepository<typeof sysNotice> {
  constructor(db?: BunSQLDatabase) {
    super(
      {
        table: sysNotice,
        queryOptions: {
          orderBy: [desc(sysNotice.id)],
        },
      },
      db
    )
  }
}

/**
 * 通知公告已读仓储
 *
 * 已读表只服务「标记已读」这一个入口，不需要单独模块，也不需要查询缓存。
 */
export class SysNoticeReadRepository extends CrudRepository<
  typeof sysNoticeRead
> {
  constructor(db?: BunSQLDatabase) {
    super(
      {
        table: sysNoticeRead,
        queryOptions: {
          orderBy: [desc(sysNoticeRead.id)],
        },
      },
      db
    )
  }

  /**
   * 查询某个用户对某条通知的已读记录
   */
  async findRead(noticeId: string, userId: string) {
    const [row] = await this.getMany({
      where: and(
        eq(sysNoticeRead.noticeId, noticeId),
        eq(sysNoticeRead.userId, userId)
      ),
    })
    return row
  }
}
