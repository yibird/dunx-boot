import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { drizzle, type BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { sessionContext, type SessionContext } from '@/infra/context'
import { AiSkillRepository } from '@/features/ai/skill/repository'
import type { AiSkillQuery } from '@/features/ai/skill/schema'
import { aiSkill } from '@/schemas'

interface PgAdminClient {
  connect(): Promise<void>
  end(): Promise<void>
  query<T = Record<string, unknown>>(
    text: string,
    values?: unknown[]
  ): Promise<{ rows: T[]; rowCount: number | null }>
}
const { Client } = createRequire(import.meta.url)('pg') as {
  Client: new (options: {
    connectionString: string
    connectionTimeoutMillis: number
    query_timeout: number
  }) => PgAdminClient
}
const databaseTests =
  Bun.env['AI_SKILL_DB_TEST'] === '1' ? describe : describe.skip
const schemaName = `ai_skill_test_${crypto.randomUUID().replaceAll('-', '')}`
const quotedSchema = `"${schemaName}"`
const owner: SessionContext = {
  userId: '10',
  tenantId: '20',
  account: 'skill-tester',
}
const otherOwner: SessionContext = { ...owner, userId: '11' }
const otherTenant: SessionContext = { ...owner, tenantId: '21' }
const tenantless: SessionContext = {
  userId: owner.userId,
  account: owner.account,
}
let connectionUrl: string
let schemaCreated = false
let client: Bun.SQL | undefined
let db: BunSQLDatabase
let repository: AiSkillRepository

function asActor<T>(actor: SessionContext, action: () => T): T {
  return sessionContext.run(actor, action)
}

function fixture(
  actor: SessionContext,
  input: Partial<typeof aiSkill.$inferInsert>
) {
  return asActor(actor, () =>
    repository.create({ name: '测试技能', content: '测试指令', ...input })
  )
}

databaseTests('Skill PostgreSQL behavior in an isolated schema', () => {
  beforeAll(async () => {
    if (!Bun.env.DATABASE_URL)
      throw new Error('AI_SKILL_DB_TEST requires DATABASE_URL')
    const url = new URL(Bun.env.DATABASE_URL)
    url.searchParams.delete('search_path')
    url.searchParams.delete('options')
    connectionUrl = url.toString()
    if (!/^ai_skill_test_[a-f0-9]{32}$/.test(schemaName))
      throw new Error('Unsafe test schema')
    const setup = new Client({
      connectionString: connectionUrl,
      connectionTimeoutMillis: 5000,
      query_timeout: 5000,
    })
    await setup.connect()
    try {
      await setup.query(`CREATE SCHEMA ${quotedSchema}`)
      schemaCreated = true
      await setup.query(`SET search_path TO ${quotedSchema}`)
      expect(
        (
          await setup.query<{ schema: string }>(
            'SELECT current_schema() AS schema'
          )
        ).rows[0]?.schema
      ).toBe(schemaName)
      const migrationRoot = new URL('../drizzle/', import.meta.url)
      const files = Array.from(
        new Bun.Glob('*/migration.sql').scanSync({
          cwd: fileURLToPath(migrationRoot),
          onlyFiles: true,
        })
      ).sort()
      const migrations = await Promise.all(
        files.map((file) =>
          Bun.file(new URL(file.replaceAll('\\', '/'), migrationRoot)).text()
        )
      )
      const statements = migrations
        .flatMap((migration) => migration.split('--> statement-breakpoint'))
        .filter((statement) => /^\s*CREATE TABLE "ai_skill"/.test(statement))
      expect(statements).toHaveLength(1)
      for (const statement of statements) {
        if (/\bpublic"?\s*\./i.test(statement))
          throw new Error('Qualified public DDL is prohibited')
        await setup.query(statement)
      }
    } finally {
      await setup.end()
    }
    client = new Bun.SQL(connectionUrl, {
      connection: {
        search_path: schemaName,
        statement_timeout: 5000,
        lock_timeout: 3000,
      },
      connectionTimeout: 5,
      idleTimeout: 5,
      max: 4,
    })
    const [scope] = await client`SELECT current_schema() AS schema`
    expect(scope?.schema).toBe(schemaName)
    db = drizzle({ client })
    repository = new AiSkillRepository(db)
  }, 20000)

  afterAll(async () => {
    await client?.close({ timeout: 5 })
    if (!schemaCreated) return
    if (!/^ai_skill_test_[a-f0-9]{32}$/.test(schemaName))
      throw new Error('Unsafe test schema cleanup')
    const cleanup = new Client({
      connectionString: connectionUrl,
      connectionTimeoutMillis: 5000,
      query_timeout: 5000,
    })
    await cleanup.connect()
    try {
      await cleanup.query(`DROP SCHEMA ${quotedSchema} CASCADE`)
      expect(
        (
          await cleanup.query('SELECT 1 FROM pg_namespace WHERE nspname = $1', [
            schemaName,
          ])
        ).rowCount
      ).toBe(0)
    } finally {
      await cleanup.end()
    }
  }, 15000)

  test('keeps public/private, enabled/deleted and tenant boundaries in the actual selection results', async () => {
    const own = await fixture(owner, { name: 'selection-own' })
    const shared = await fixture(otherOwner, {
      name: 'selection-public',
      visibility: 'public',
    })
    await fixture(otherOwner, { name: 'selection-private' })
    await fixture(otherTenant, {
      name: 'selection-foreign',
      visibility: 'public',
    })
    await fixture(owner, { name: 'selection-disabled', dataStatus: false })
    const removed = await fixture(owner, { name: 'selection-deleted' })
    await asActor(owner, () => repository.delete(removed.id))
    await fixture(tenantless, {
      name: 'selection-tenantless',
      visibility: 'public',
    })

    const available = await asActor(owner, () =>
      repository.available({ current: 1, pageSize: 20, name: 'selection-' })
    )
    expect(available.list.map((skill) => skill.id).sort()).toEqual(
      [own.id, shared.id].sort()
    )
    expect(available.total).toBe(2)
    expect(available.list.every((skill) => !('content' in skill))).toBe(true)
    const managed = await asActor(owner, () =>
      repository.findMany<Partial<AiSkillQuery>>({ name: 'selection-' })
    )
    expect(managed.map((skill) => skill.name).sort()).toEqual([
      'selection-disabled',
      'selection-own',
    ])
    expect(
      await asActor(owner, () => repository.findById(shared.id))
    ).toBeUndefined()
    await expect(
      asActor(owner, () =>
        repository.update(shared.id, { content: 'stolen', version: 99 })
      )
    ).rejects.toMatchObject({ status: 404 })
    await expect(
      asActor(owner, () => repository.delete(shared.id))
    ).rejects.toMatchObject({ status: 404 })
    expect(
      (await asActor(otherOwner, () => repository.findById(shared.id)))?.content
    ).toBe('测试指令')
  })

  test('limits tenantless selection to NULL tenant rows and applies pagination consistently', async () => {
    const own = await fixture(tenantless, { name: 'tenantless-own', sort: 1 })
    await fixture(
      { userId: '12', account: 'other' },
      { name: 'tenantless-public', visibility: 'public', sort: 2 }
    )
    await fixture(
      { userId: '12', account: 'other' },
      { name: 'tenantless-private' }
    )
    await fixture(owner, {
      name: 'tenantless-with-tenant',
      visibility: 'public',
    })
    const available = await asActor(tenantless, () =>
      repository.available({ current: 1, pageSize: 1, name: 'tenantless-' })
    )
    expect(available.total).toBe(2)
    expect(available.list.map((skill) => skill.id)).toEqual([own.id])
    expect(available.pages).toBe(2)
  })

  test('persists versioned edits and soft-delete audit without accepting spoofed ownership', async () => {
    const row = await fixture(owner, {
      name: 'lifecycle',
      ownerUserId: '999',
      tenantId: '999',
      id: '999',
      version: 999,
      deleted: true,
    })
    expect(row).toMatchObject({
      ownerUserId: owner.userId,
      tenantId: owner.tenantId,
      version: 1,
      deleted: false,
    })
    expect(row.id).not.toBe('999')
    const updated = await asActor(owner, () =>
      repository.update(row.id, {
        content: '新版指令',
        version: 1,
        ownerUserId: '999',
        tenantId: '999',
      })
    )
    expect(updated).toMatchObject({
      content: '新版指令',
      version: 2,
      ownerUserId: owner.userId,
      tenantId: owner.tenantId,
    })
    await expect(
      asActor(owner, () =>
        repository.update(row.id, { content: '过期指令', version: 1 })
      )
    ).rejects.toMatchObject({ status: 409 })
    await asActor(owner, () => repository.delete(row.id, false))
    expect(
      await asActor(owner, () => repository.findById(row.id))
    ).toBeUndefined()
    const [deleted] = await db
      .select()
      .from(aiSkill)
      .where(eq(aiSkill.id, row.id))
    expect(deleted).toMatchObject({
      deleted: true,
      version: 3,
      deleteBy: owner.userId,
      deleterName: owner.account,
      content: '新版指令',
    })
    expect(deleted?.deletedAt).not.toBeNull()
  })
})
