import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { inArray, like } from 'drizzle-orm'
import { sessionContext, type SessionContext } from '@/infra/context'
import { createDb } from '@/infra/db/database/db'
import { SysMessageRepository } from '@/features/sys/message/repository'
import { SysMessageService } from '@/features/sys/message/service'
import { relations, sysMessage, sysMessageRead } from '@/schemas'

const databaseTests = Bun.env['DATABASE_URL'] ? describe : describe.skip
const databaseUrl = Bun.env['DATABASE_URL']!
const prefix = `crud-it-message-${crypto.randomUUID().slice(0, 8)}`
const actor: SessionContext = {
  userId: '9301',
  account: 'message-integration',
  tenantId: '1301',
}

let db: Awaited<ReturnType<typeof createDb>>
let service: SysMessageService
const messageIds: string[] = []

function asActor<T>(callback: () => T): T {
  return sessionContext.run(actor, callback)
}

databaseTests('SysMessageRepository/Service 真实 PostgreSQL 行为', () => {
  beforeAll(async () => {
    db = await createDb({ url: databaseUrl, drizzle: { relations } })
    service = new SysMessageService(new SysMessageRepository(db))
  })

  afterAll(async () => {
    if (messageIds.length) {
      await db
        .delete(sysMessageRead)
        .where(inArray(sysMessageRead.messageId, messageIds))
      await db.delete(sysMessage).where(inArray(sysMessage.id, messageIds))
    }
    await db.delete(sysMessage).where(like(sysMessage.title, `${prefix}%`))
    await db.$client.close()
  })

  test('create 自动填充发送人', async () => {
    const row = await asActor(() =>
      service.create({ title: `${prefix}-消息A` })
    )
    messageIds.push(row.id)

    expect(row.senderId).toBe(actor.userId)
    expect(row.senderName).toBe(actor.account!)
    expect(row.tenantId).toBe(actor.tenantId!)
  })

  test('getReadMessages 按消息与用户过滤已读记录', async () => {
    const message = await asActor(() =>
      service.create({ title: `${prefix}-消息B` })
    )
    messageIds.push(message.id)

    await db.insert(sysMessageRead).values([
      {
        messageId: message.id,
        userId: actor.userId,
        tenantId: actor.tenantId!,
      },
      {
        messageId: message.id,
        userId: '9302',
        tenantId: actor.tenantId!,
      },
    ])

    const byUser = await asActor(() =>
      service.getReadMessages({ messageId: message.id, userId: actor.userId })
    )
    expect(byUser).toHaveLength(1)
    expect(byUser[0]?.userId).toBe(actor.userId)

    const byMessage = await asActor(() =>
      service.getReadMessages({ messageId: message.id })
    )
    expect(byMessage).toHaveLength(2)
  })

  test('getReadMessageByUserId 返回单条或 undefined', async () => {
    const message = await asActor(() =>
      service.create({ title: `${prefix}-消息C` })
    )
    messageIds.push(message.id)

    await db.insert(sysMessageRead).values({
      messageId: message.id,
      userId: actor.userId,
      tenantId: actor.tenantId!,
    })

    const found = await asActor(() =>
      service.getReadMessageByUserId(message.id, actor.userId)
    )
    expect(found?.messageId).toBe(message.id)

    const missing = await asActor(() =>
      service.getReadMessageByUserId(message.id, '9303')
    )
    expect(missing).toBeUndefined()
  })
})
