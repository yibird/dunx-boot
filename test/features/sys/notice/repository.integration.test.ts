import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { inArray } from 'drizzle-orm'
import { NotFoundError } from '@/errors'
import { sessionContext, type SessionContext } from '@/infra/context'
import { createDb } from '@/infra/db/database/db'
import {
  SysNoticeReadRepository,
  SysNoticeRepository,
} from '@/features/sys/notice/repository'
import { SysNoticeService } from '@/features/sys/notice/service'
import { relations, sysNotice, sysNoticeRead } from '@/schemas'

const databaseTests = Bun.env['DATABASE_URL'] ? describe : describe.skip
const databaseUrl = Bun.env['DATABASE_URL']!
const prefix = `crud-it-notice-${crypto.randomUUID().slice(0, 8)}`
const actor: SessionContext = {
  userId: '9401',
  account: 'notice-integration',
  tenantId: '1401',
}

let db: Awaited<ReturnType<typeof createDb>>
let service: SysNoticeService
const noticeIds: string[] = []

function asActor<T>(callback: () => T): T {
  return sessionContext.run(actor, callback)
}

databaseTests('SysNoticeService 真实 PostgreSQL 行为', () => {
  beforeAll(async () => {
    db = await createDb({ url: databaseUrl, drizzle: { relations } })
    service = new SysNoticeService(
      new SysNoticeRepository(db),
      new SysNoticeReadRepository(db)
    )
  })

  afterAll(async () => {
    if (noticeIds.length) {
      await db
        .delete(sysNoticeRead)
        .where(inArray(sysNoticeRead.noticeId, noticeIds))
      await db.delete(sysNotice).where(inArray(sysNotice.id, noticeIds))
    }
    await db.$client.close()
  })

  test('create 自动填充发布人', async () => {
    const row = await asActor(() =>
      service.create({ title: `${prefix}-公告A` })
    )
    noticeIds.push(row.id)

    expect(row.publisherId).toBe(actor.userId)
    expect(row.publisherName).toBe(actor.account!)
    expect(row.tenantId).toBe(actor.tenantId!)
  })

  test('read 幂等：重复读取返回同一条已读记录', async () => {
    const notice = await asActor(() =>
      service.create({ title: `${prefix}-公告B` })
    )
    noticeIds.push(notice.id)

    const first = await asActor(() => service.read(notice.id))
    const second = await asActor(() => service.read(notice.id))

    expect(first.code).toBe(0)
    expect(first.data).toMatchObject({
      noticeId: notice.id,
      userId: actor.userId,
    })
    expect(second.data).toEqual(first.data)
  })

  test('read 对不存在的通知抛出 NotFoundError', async () => {
    await expect(
      asActor(() => service.read('999999999'))
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  test('findRead 按通知与用户查询', async () => {
    const notice = await asActor(() =>
      service.create({ title: `${prefix}-公告C` })
    )
    noticeIds.push(notice.id)
    await asActor(() => service.read(notice.id))

    const readRepository = new SysNoticeReadRepository(db)
    const found = await asActor(() =>
      readRepository.findRead(notice.id, actor.userId)
    )
    expect(found?.noticeId).toBe(notice.id)

    const missing = await asActor(() =>
      readRepository.findRead(notice.id, '9402')
    )
    expect(missing).toBeUndefined()
  })
})
