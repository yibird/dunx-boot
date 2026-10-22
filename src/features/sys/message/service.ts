import { CrudService } from '@/infra/crud'
import { sessionContext } from '@/infra/context'
import { sysMessage } from '@/schemas'
import { SysMessageRepository } from './repository'
import type { SysMessageReadQuery } from './schema'

/**
 * 系统消息业务层
 */
export class SysMessageService extends CrudService<
  typeof sysMessage,
  SysMessageRepository
> {
  constructor(override readonly repository: SysMessageRepository) {
    super(repository)
  }

  /**
   * 发送人取当前会话；系统侧写入没有会话时留空
   */
  override async create(input: Partial<typeof sysMessage.$inferInsert>) {
    const session = sessionContext.get()
    return super.create({
      ...input,
      senderId: session?.userId,
      senderName: session?.account,
    })
  }

  // 标记单个方法已读
  markAsRead(messageId: string) {
    return this.repository.markAsRead(messageId)
  }

  // 标记所有方法已读
  markAllAsRead() {
    return this.repository.markAllAsRead()
  }

  getReadMessages(query: SysMessageReadQuery) {
    return this.repository.getReadMessages(query)
  }
  getReadMessageByUserId(messageId: string, userId: string) {
    return this.repository.getReadMessageByUserId(messageId, userId)
  }
}
