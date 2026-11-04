import { desc, eq } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { mergeAnd } from '@/infra/db'
import { sysMessage, sysMessageRead } from '@/schemas'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import type { SysMessageReadQuery } from './schema'

/**
 * 系统消息仓储
 */
export class SysMessageRepository extends CrudRepository<typeof sysMessage> {
  constructor(override readonly db: BunSQLDatabase) {
    super(
      {
        table: sysMessage,
        queryOptions: {
          orderBy: [desc(sysMessage.id)],
        },
      },
      db
    )
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
          query.messageId
            ? eq(sysMessageRead.messageId, query.messageId)
            : undefined,
          query.userId ? eq(sysMessageRead.userId, query.userId) : undefined
        )
      )
      .orderBy(desc(sysMessageRead.createdAt))
    return rows
  }

  /**
   * 查询某个用户对某条消息的已读记录
   */
  async getReadMessageByUserId(messageId: string, userId: string) {
    const [row] = await this.db
      .select()
      .from(sysMessageRead)
      .where(
        mergeAnd(
          eq(sysMessageRead.messageId, messageId),
          eq(sysMessageRead.userId, userId)
        )
      )
      .limit(1)
    return row
  }

  async markAsRead(messageId: string) {
    console.log('messageId', messageId)
  }

  async markAllAsRead() {}
}
