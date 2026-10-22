import { desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { sysNotice, sysNoticeRead } from '@/schemas'
import type { SysNoticeQuery, SysNoticeReadQuery } from './schema'

/**
 * 通知公告仓储
 */
export class SysNoticeRepository extends CrudRepository<typeof sysNotice> {
  constructor() {
    super({
      table: sysNotice,
      cache: true,
      defaultOrderBy: [desc(sysNotice.id)],
    })
  }

  override getQueryOptions(query: Partial<SysNoticeQuery>) {
    return {
      where: mergeAnd(
        ilikeIf(sysNotice.title, query.title),
        eqIf(sysNotice.noticeType, query.noticeType),
        eqIf(sysNotice.sendMode, query.sendMode),
        eqIf(sysNotice.dataStatus, query.dataStatus)
      ),
    }
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
  constructor() {
    super({
      table: sysNoticeRead,
      defaultOrderBy: [desc(sysNoticeRead.id)],
    })
  }

  override getQueryOptions(query: SysNoticeReadQuery) {
    return {
      where: mergeAnd(
        eqIf(sysNoticeRead.noticeId, query.noticeId),
        eqIf(sysNoticeRead.userId, query.userId)
      ),
    }
  }

  /**
   * 查询某个用户对某条通知的已读记录
   */
  async findRead(noticeId: string, userId: string) {
    const [row] = await this.findMany<SysNoticeReadQuery>({
      noticeId,
      userId,
    })
    return row
  }
}
