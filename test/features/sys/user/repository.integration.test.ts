import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { like } from 'drizzle-orm'
import { sessionContext, type SessionContext } from '@/infra/context'
import { createDb } from '@/infra/db/database/db'
import { SysUserRepository } from '@/features/sys/user/repository'
import { relations, sysUser } from '@/schemas'

const databaseTests = Bun.env['DATABASE_URL'] ? describe : describe.skip
const databaseUrl = Bun.env['DATABASE_URL']!
const prefix = `crud-it-user-${crypto.randomUUID().slice(0, 8)}`
const actor: SessionContext = {
  userId: '9101',
  account: 'user-integration',
  tenantId: '1101',
}

let db: Awaited<ReturnType<typeof createDb>>
let repository: SysUserRepository

function asActor<T>(callback: () => T): T {
  return sessionContext.run(actor, callback)
}

databaseTests('SysUserRepository 真实 PostgreSQL 行为', () => {
  beforeAll(async () => {
    db = await createDb({ url: databaseUrl, drizzle: { relations } })
    repository = new SysUserRepository(db)
  })

  afterAll(async () => {
    await db.delete(sysUser).where(like(sysUser.account, `${prefix}%`))
    await db.$client.close()
  })

  test('findByAccount 按账号精确查询', async () => {
    const account = `${prefix}-account`
    await asActor(() =>
      repository.create({
        account,
        password: 'hashed',
        nickname: '账号用户',
      })
    )

    const found = await asActor(() => repository.findByAccount(account))
    expect(found?.account).toBe(account)
    expect(found?.tenantId).toBe(actor.tenantId!)
  })

  test('findByEmail 同时匹配 email 与 account', async () => {
    const email = `${prefix}@example.com`
    await asActor(() =>
      repository.create({
        account: email,
        password: 'hashed',
        nickname: '邮箱用户',
        email,
      })
    )

    const byEmail = await asActor(() => repository.findByEmail(email))
    expect(byEmail?.email).toBe(email)

    const byAccount = await asActor(() =>
      repository.findByEmail(`${prefix}-account`)
    )
    expect(byAccount?.account).toBe(`${prefix}-account`)
  })

  test('findByPhone 同时匹配 phone 与 account', async () => {
    const phone = `139${Date.now().toString().slice(-8)}`
    await asActor(() =>
      repository.create({
        account: phone,
        password: 'hashed',
        nickname: '手机用户',
        phone,
      })
    )

    const byPhone = await asActor(() => repository.findByPhone(phone))
    expect(byPhone?.phone).toBe(phone)
  })

  test('未命中时返回 undefined', async () => {
    expect(
      await asActor(() => repository.findByAccount(`${prefix}-missing`))
    ).toBeUndefined()
    expect(
      await asActor(() => repository.findByEmail(`${prefix}-missing`))
    ).toBeUndefined()
    expect(
      await asActor(() => repository.findByPhone(`${prefix}-missing`))
    ).toBeUndefined()
  })
})
