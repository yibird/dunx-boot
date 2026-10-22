import { afterAll, beforeAll, describe, expect, spyOn, test } from 'bun:test'
import { and, eq, count } from 'drizzle-orm'
import { drizzle, type BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { DEFAULT_TENANT_ID } from '@/constants'
import { AiAgentRepository } from '@/features/ai/agent/repository'
import { aiAgentCreateReqSchema } from '@/features/ai/agent/schema'
import { sessionContext, type SessionContext } from '@/infra/context'
import { aiAgent, aiAgentSkill, aiSkill, type AiAgent } from '@/schemas'

const databaseTests =
  Bun.env['AI_AGENT_DB_TEST'] === '1' ? describe : describe.skip
const schemaName = `ai_agent_test_${crypto.randomUUID().replaceAll('-', '')}`
const quotedSchema = `"${schemaName}"`
const owner: SessionContext = {
  userId: '10',
  tenantId: '20',
  account: 'agent-test',
}
const other: SessionContext = { ...owner, userId: '11' }
const foreign: SessionContext = { ...owner, tenantId: '21' }
const tenantless: SessionContext = { userId: '10', account: 'agent-test' }
let admin: Bun.SQL
let client: Bun.SQL
let db: BunSQLDatabase
let repository: AiAgentRepository
let created = false

function asActor<T>(actor: SessionContext, action: () => T): T {
  return sessionContext.run(actor, action)
}

async function skill(
  actor = owner,
  values: Partial<typeof aiSkill.$inferInsert> = {}
) {
  const [row] = await db
    .insert(aiSkill)
    .values({
      name: 'Test skill',
      content: 'Write concise answers.',
      ownerUserId: actor.userId,
      tenantId: actor.tenantId ?? DEFAULT_TENANT_ID,
      ...values,
    })
    .returning()
  return row!
}

function createAgent(
  skillIds: string[] = [],
  name = 'Test agent',
  actor = owner
) {
  return asActor(actor, () =>
    repository.create(aiAgentCreateReqSchema.parse({ name, skillIds }))
  )
}

databaseTests('Agent PostgreSQL skill bindings in an isolated schema', () => {
  beforeAll(async () => {
    if (!Bun.env.DATABASE_URL)
      throw new Error('AI_AGENT_DB_TEST requires DATABASE_URL')
    const url = new URL(Bun.env.DATABASE_URL)
    url.searchParams.delete('search_path')
    url.searchParams.delete('options')
    admin = new Bun.SQL(url.toString(), { max: 1, connectionTimeout: 5 })
    await admin.unsafe(`CREATE SCHEMA ${quotedSchema}`)
    created = true
    await admin.unsafe(`SET search_path TO ${quotedSchema}`)
    const needed = new Set([
      'ai_agent',
      'ai_model',
      'ai_skill',
      'ai_agent_skill',
    ])
    const built = new Set<string>()
    const migrationRoot = new URL(
      '../drizzle/',
      import.meta.url
    ).pathname.replace(/^\/([A-Za-z]:)/, '$1')
    const paths = [
      ...new Bun.Glob('*/migration.sql').scanSync({
        cwd: migrationRoot,
        absolute: true,
      }),
    ].sort()
    for (const path of paths) {
      const text = await Bun.file(path).text()
      for (const statement of text.split('--> statement-breakpoint')) {
        const match = /^\s*(?:CREATE TABLE|ALTER TABLE)\s+"([a-z_]+)"/.exec(
          statement
        )
        const index =
          /^\s*CREATE (?:UNIQUE )?INDEX\s+"[a-z_]+"\s+ON\s+"([a-z_]+)"/.exec(
            statement
          )
        const table = match?.[1] ?? index?.[1]
        if (!table || !needed.has(table)) continue
        if (/^\s*CREATE TABLE/.test(statement)) built.add(table)
        const isolated = statement.replaceAll('"public".', `${quotedSchema}.`)
        if (/\bpublic\s*\./i.test(isolated))
          throw new Error('Public DDL prohibited')
        await admin.unsafe(isolated)
      }
    }
    expect([...built].sort()).toEqual([...needed].sort())
    client = new Bun.SQL(url.toString(), {
      max: 4,
      connectionTimeout: 5,
      connection: {
        search_path: schemaName,
        statement_timeout: 5000,
        lock_timeout: 3000,
      },
    })
    const [scope] = await client`SELECT current_schema() AS schema`
    expect(scope?.schema).toBe(schemaName)
    db = drizzle({ client })
    repository = new AiAgentRepository(db)
  }, 20000)

  afterAll(async () => {
    await client?.close({ timeout: 5 })
    if (created) {
      if (!/^ai_agent_test_[a-f0-9]{32}$/.test(schemaName))
        throw new Error('Unsafe cleanup schema')
      await admin.unsafe(`DROP SCHEMA ${quotedSchema} CASCADE`)
    }
    await admin?.close({ timeout: 5 })
  }, 15000)

  test('creates ordered bindings, preserves omission and clears explicitly', async () => {
    const first = await skill()
    const second = await skill(other, { visibility: 'public' })
    const agent = await createAgent([second.id, first.id])
    expect(agent.skillIds).toEqual([second.id, first.id])
    await asActor(owner, async () => {
      expect((await repository.getRecord(agent.id)).skillIds).toEqual([
        second.id,
        first.id,
      ])
      expect(
        (await repository.update(agent.id, { name: 'Renamed' })).skillIds
      ).toEqual([second.id, first.id])
      expect(
        (await repository.update(agent.id, { skillIds: [first.id, second.id] }))
          .skillIds
      ).toEqual([first.id, second.id])
      expect(
        (await repository.update(agent.id, { skillIds: [] })).skillIds
      ).toEqual([])
    })
  })

  test('rejects private foreign, other-tenant, disabled, deleted and missing skills without partial creation', async () => {
    const invalid = [
      await skill(other),
      await skill(foreign, { visibility: 'public' }),
      await skill(owner, { dataStatus: false }),
      await skill(owner, { deleted: true }),
    ]
    const name = `rejected-${crypto.randomUUID()}`
    for (const id of [...invalid.map((row) => row.id), '9223372036854775807']) {
      await expect(createAgent([id], name)).rejects.toMatchObject({
        status: 400,
      })
    }
    const [result] = await db
      .select({ total: count() })
      .from(aiAgent)
      .where(eq(aiAgent.name, name))
    expect(result?.total).toBe(0)
  })

  test('rolls back Agent fields and old bindings when replacement is invalid', async () => {
    const usable = await skill()
    const forbidden = await skill(other)
    const agent = await createAgent([usable.id])
    await asActor(owner, async () => {
      await expect(
        repository.update(agent.id, {
          name: 'Must rollback',
          skillIds: [forbidden.id],
        })
      ).rejects.toMatchObject({ status: 400 })
      const unchanged = await repository.getRecord(agent.id)
      expect(unchanged.name).toBe(agent.name)
      expect(unchanged.version).toBe(agent.version)
      expect(unchanged.skillIds).toEqual([usable.id])
    })
  })

  test('rejects protected fields through direct repository calls before any write', async () => {
    const entry = await skill()
    const agent = await createAgent([entry.id])
    const protectedValues = {
      id: '9223372036854775806',
      ownerUserId: other.userId,
      tenantId: foreign.tenantId,
      deleted: true,
      createdAt: '2000-01-01 00:00:00',
      createBy: other.userId,
    }
    await asActor(owner, async () => {
      for (const [property, value] of Object.entries(protectedValues)) {
        const input = {
          ...aiAgentCreateReqSchema.parse({ name: 'Invalid internal input' }),
          [property]: value,
        }
        await expect(repository.create(input)).rejects.toMatchObject({
          status: 400,
        })
        await expect(
          repository.update(agent.id, {
            name: 'Invalid internal input',
            [property]: value,
          })
        ).rejects.toMatchObject({ status: 400 })
      }
      const current = await repository.getRecord(agent.id)
      expect(current).toMatchObject({
        id: agent.id,
        name: agent.name,
        version: agent.version,
        ownerUserId: owner.userId,
        tenantId: owner.tenantId,
        deleted: false,
        skillIds: [entry.id],
      })
      const [inserted] = await db
        .select({ total: count() })
        .from(aiAgent)
        .where(eq(aiAgent.name, 'Invalid internal input'))
      expect(inserted?.total).toBe(0)
    })
  })

  test.each(['record', 'list', 'page'] as const)(
    'keeps the %s Agent and skills on the same snapshot during replacement',
    async (kind) => {
      const initial = await skill()
      const replacement = await skill()
      const name = `snapshot-${crypto.randomUUID()}`
      const agent = await createAgent([initial.id], name)
      const writer = new AiAgentRepository(db)
      const target = repository as unknown as {
        withSkills(
          database: Pick<BunSQLDatabase, 'select' | 'insert' | 'update'>,
          rows: AiAgent[]
        ): Promise<(AiAgent & { skillIds: string[] })[]>
      }
      const original = target.withSkills.bind(repository)
      // 在读取主记录后、读取关联前提交另一个连接上的真实更新，确定性复现两次查询间的竞争。
      const interleave = spyOn(target, 'withSkills').mockImplementationOnce(
        async (tx, rows) => {
          await writer.update(agent.id, {
            name: `${name}-new`,
            skillIds: [replacement.id],
            version: agent.version,
          })
          return original(tx, rows)
        }
      )
      try {
        await asActor(owner, async () => {
          const rows =
            kind === 'record'
              ? [await repository.getRecord(agent.id)]
              : kind === 'list'
                ? await repository.getList({ name })
                : (
                    await repository.getPageList({
                      name,
                      current: 1,
                      pageSize: 10,
                    })
                  ).list
          const snapshot = rows.find((row) => row.id === agent.id)
          expect(snapshot).toMatchObject({
            name,
            version: agent.version,
            skillIds: [initial.id],
          })
          const current = await repository.getRecord(agent.id)
          expect(current).toMatchObject({
            name: `${name}-new`,
            version: agent.version + 1,
            skillIds: [replacement.id],
          })
        })
      } finally {
        interleave.mockRestore()
      }
    }
  )

  test('requires owner and tenant for reads, changes and deletion', async () => {
    const own = await createAgent()
    for (const actor of [other, foreign, tenantless]) {
      await asActor(actor, async () => {
        await expect(repository.getRecord(own.id)).rejects.toMatchObject({
          status: 404,
        })
        await expect(
          repository.update(own.id, { name: 'Forbidden' })
        ).rejects.toMatchObject({ status: 404 })
        await expect(repository.delete(own.id)).rejects.toMatchObject({
          status: 404,
        })
        expect(
          (await repository.getList()).some((row) => row.id === own.id)
        ).toBe(false)
      })
    }
    const unscoped = await skill(tenantless)
    const tenantlessAgent = await createAgent(
      [unscoped.id],
      'Tenantless',
      tenantless
    )
    expect(tenantlessAgent.tenantId).toBe(DEFAULT_TENANT_ID)
    expect(tenantlessAgent.skillIds).toEqual([unscoped.id])
    await expect(createAgent([unscoped.id])).rejects.toMatchObject({
      status: 400,
    })
  })

  test('serializes concurrent versioned updates and preserves the winner binding', async () => {
    const first = await skill()
    const second = await skill()
    const agent = await createAgent()
    const results = await asActor(owner, () =>
      Promise.allSettled([
        repository.update(agent.id, {
          skillIds: [first.id],
          version: agent.version,
        }),
        repository.update(agent.id, {
          skillIds: [second.id],
          version: agent.version,
        }),
      ])
    )
    expect(
      results.filter((result) => result.status === 'fulfilled')
    ).toHaveLength(1)
    const rejected = results.find(
      (result) => result.status === 'rejected'
    ) as PromiseRejectedResult
    expect(rejected.reason.status).toBe(409)
    const saved = await asActor(owner, () => repository.getRecord(agent.id))
    expect(saved.version).toBe(agent.version + 1)
    expect(saved.skillIds).toHaveLength(1)
  })

  test('soft-deletes bindings together with the Agent', async () => {
    const entry = await skill()
    const agent = await createAgent([entry.id])
    await asActor(owner, async () => {
      await repository.delete(agent.id)
      await expect(repository.getRecord(agent.id)).rejects.toMatchObject({
        status: 404,
      })
    })
    const active = await db
      .select()
      .from(aiAgentSkill)
      .where(
        and(eq(aiAgentSkill.agentId, agent.id), eq(aiAgentSkill.deleted, false))
      )
    expect(active).toHaveLength(0)
  })

  test('enforces binding foreign keys and prevents duplicate active pairs', async () => {
    const entry = await skill()
    const agent = await createAgent([entry.id])
    await expect(
      db
        .insert(aiAgentSkill)
        .values({ agentId: agent.id, skillId: entry.id })
        .execute()
    ).rejects.toThrow()
    await expect(
      db
        .insert(aiAgentSkill)
        .values({ agentId: agent.id, skillId: '9223372036854775807' })
        .execute()
    ).rejects.toThrow()
  })
})
