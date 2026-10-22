import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { drizzle, BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { sessionContext, type SessionContext } from '@/infra/context'
import { DEFAULT_TENANT_ID } from '@/constants'
import { AiChatSessionRepository } from '@/features/ai/chat/session/repository'
import { aiModel, aiModelProvider } from '@/schemas'

/**
 * The migration tool already supplies pg; this test needs only its admin client.
 */
interface PgAdminClient {
  connect(): Promise<void>
  end(): Promise<void>
  query<T = Record<string, unknown>>(
    text: string,
    values?: unknown[]
  ): Promise<{
    rows: T[]
    rowCount: number | null
  }>
}

const { Client } = createRequire(import.meta.url)('pg') as {
  Client: new (options: {
    connectionString: string
    connectionTimeoutMillis: number
    query_timeout: number
  }) => PgAdminClient
}

/**
 * Opt-in PostgreSQL verification: every table and row lives in a fresh schema.
 */
const databaseTests =
  Bun.env['AI_CHAT_DB_TEST'] === '1' ? describe : describe.skip
const schemaName = `ai_chat_test_${crypto.randomUUID().replaceAll('-', '')}`
const quotedSchema = `"${schemaName}"`
const owner: SessionContext = {
  userId: '10',
  tenantId: '20',
  account: 'chat-test',
}
const otherOwner: SessionContext = { ...owner, userId: '11' }
let connectionUrl: string
let schemaCreated = false
let clients: Bun.SQL[] = []
let db: BunSQLDatabase
let repository: AiChatSessionRepository

function asActor<T>(actor: SessionContext, action: () => T): T {
  return sessionContext.run(actor, action)
}

databaseTests('AI chat sessions in an isolated schema', () => {
  beforeAll(async () => {
    const configured = Bun.env.DATABASE_URL
    if (!configured) throw new Error('AI_CHAT_DB_TEST requires DATABASE_URL')
    const url = new URL(configured)
    url.searchParams.delete('search_path')
    url.searchParams.delete('options')
    connectionUrl = url.toString()
    if (!/^ai_chat_test_[a-f0-9]{32}$/.test(schemaName))
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
      const scope = await setup.query<{ schema: string }>(
        'SELECT current_schema() AS schema'
      )
      expect(scope.rows[0]?.schema).toBe(schemaName)
      const migrationRoot = new URL('../drizzle/', import.meta.url)
      const migrationFiles = Array.from(
        new Bun.Glob('*/migration.sql').scanSync({
          cwd: fileURLToPath(migrationRoot),
          onlyFiles: true,
        })
      ).sort()
      const migrations = await Promise.all(
        migrationFiles.map((file) =>
          Bun.file(new URL(file.replaceAll('\\', '/'), migrationRoot)).text()
        )
      )
      const neededTables = new Set([
        'ai_chat_session',
        'ai_model',
        'ai_model_provider',
      ])
      // 建表之后的 ALTER（例如 chat_id 去掉 NOT NULL）也要回放，否则插入仍受旧约束。
      const statements = migrations
        .flatMap((migration) => migration.split('--> statement-breakpoint'))
        .filter((statement) => {
          const table = /^\s*(?:CREATE TABLE|ALTER TABLE) "([a-z_]+)"/.exec(
            statement
          )?.[1]
          return table !== undefined && neededTables.has(table)
        })
      for (const statement of statements) {
        if (/\bpublic"?\s*\./i.test(statement))
          throw new Error('Qualified public DDL is prohibited')
        await setup.query(statement)
      }
    } finally {
      await setup.end()
    }
    clients = [
      new Bun.SQL(connectionUrl, {
        connection: {
          search_path: schemaName,
          statement_timeout: 5000,
          lock_timeout: 3000,
        },
        connectionTimeout: 5,
        idleTimeout: 5,
        max: 4,
      }),
    ]
    const [scope] = await clients[0]!`SELECT current_schema() AS schema`
    expect(scope?.schema).toBe(schemaName)
    db = drizzle({ client: clients[0]! })
    repository = new AiChatSessionRepository(db)
  }, 20000)

  afterAll(async () => {
    await Promise.all(clients.map((client) => client.close({ timeout: 5 })))
    if (!schemaCreated) return
    if (!/^ai_chat_test_[a-f0-9]{32}$/.test(schemaName))
      throw new Error('Unsafe schema cleanup')
    const cleanup = new Client({
      connectionString: connectionUrl,
      connectionTimeoutMillis: 5000,
      query_timeout: 5000,
    })
    await cleanup.connect()
    try {
      await cleanup.query(`DROP SCHEMA ${quotedSchema} CASCADE`)
      const remaining = await cleanup.query(
        'SELECT 1 FROM pg_namespace WHERE nspname = $1',
        [schemaName]
      )
      expect(remaining.rowCount).toBe(0)
    } finally {
      await cleanup.end()
    }
  }, 15000)

  test('creates sessions without a chat config and scopes them to the owner', async () => {
    const tenantId = owner.tenantId ?? DEFAULT_TENANT_ID
    const [provider] = await db
      .insert(aiModelProvider)
      .values({
        providerCode: `provider-${crypto.randomUUID()}`,
        providerName: '仅测试供应商',
        tenantId,
      })
      .returning()
    const [model] = await db
      .insert(aiModel)
      .values({
        providerId: provider!.id,
        modelKey: 'test-model',
        modelName: '仅测试模型',
        tenantId,
      })
      .returning()

    const session = await asActor(owner, () =>
      repository.create({ title: '第一句' })
    )
    // 会话不再绑定 chat 配置，标题取首条消息。
    expect(session.chatId).toBeNull()
    expect(session.title).toBe('第一句')

    expect(
      (await asActor(owner, () => repository.getList())).map((row) => row.id)
    ).toEqual([session.id])
    expect(
      (await asActor(otherOwner, () => repository.getList())).map(
        (row) => row.id
      )
    ).toEqual([])

    expect(
      await asActor(owner, () => repository.findById(session.id))
    ).toMatchObject({ id: session.id })
    expect(
      await asActor(otherOwner, () => repository.findById(session.id))
    ).toBeUndefined()

    expect(
      await asActor(owner, () => repository.getModel(model!.id))
    ).toMatchObject({
      model: { id: model!.id, modelKey: 'test-model' },
      provider: { id: provider!.id },
    })
  })
})
