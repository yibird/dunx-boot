import { desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { sysMessage, sysMessageRead } from '@/schemas'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import type { SysMessageQuery, SysMessageReadQuery } from './schema'

/**
 * 系统消息仓储
 */
export class SysMessageRepository extends CrudRepository<typeof sysMessage> {
  constructor(readonly db: BunSQLDatabase) {
    super({
      table: sysMessage,
      cache: true,
      defaultOrderBy: [desc(sysMessage.id)],
    })
  }

  override getQueryOptions(query: Partial<SysMessageQuery>) {
    return {
      where: mergeAnd(
        ilikeIf(sysMessage.title, query.title),
        eqIf(sysMessage.messageType, query.messageType),
        eqIf(sysMessage.level, query.level),
        eqIf(sysMessage.bizType, query.bizType),
        eqIf(sysMessage.dataStatus, query.dataStatus)
      ),
    }
  }

  /**
   * 获取已读消息列表
   *
   * @param query 查询条件
   */
  async getReadMessages(query: SysMessageReadQuery) {
    const rows = await this.db
      .select()
      .from(sysMessageRead)
      .where(
        mergeAnd(
          eqIf(sysMessageRead.messageId, query.messageId),
          eqIf(sysMessageRead.userId, query.userId)
        )
      )
      .orderBy(desc(sysMessageRead.createdAt))
    return rows
  }

  /**
   * 查询某个用户对某条消息的已读记录
   */
  async getReadMessageByUserId(messageId: string, userId: string) {
    const [row] = await this.findMany<SysMessageReadQuery>({
      messageId,
      userId,
    })
    return row
  }

  async markAsRead(messageId: string) {
    console.log('messageId', messageId)
  }

  async markAllAsRead() {}
}
