import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { Module, provide } from '@dunx/core'
import { createTestServer, type TestServer } from '@dunx/testing'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { drizzle } from 'drizzle-orm/pg-proxy'
import { AppConfigService, configSchema } from '@/infra/config'
import { AppErrorFilter } from '@/infra/http/error-filter'
import { AiAgentModule } from '@/features/ai/agent'
import {
  aiAgentCreateReqSchema,
  aiAgentUpdateBodySchema,
} from '@/features/ai/agent/schema'
import { JwtUtils } from '@/utils/jwt'
import { TokenUtils } from '@/utils/token'
import baseConfig from '../config/application'

const queries: string[] = []
const db = drizzle(async (query) => {
  queries.push(query)
  return { rows: [] }
})
// HTTP 鉴权测试只记录 SQL；真实事务和快照隔离由 ai-agent-db.test.ts 验证。
Object.defineProperty(db, 'transaction', {
  value: async (action: (tx: typeof db) => Promise<unknown>) => action(db),
})
const config = new AppConfigService(
  configSchema.parse({
    ...baseConfig,
    database: { url: 'postgres://test:test@127.0.0.1:1/agent_test' },
    security: {
      ...baseConfig.security,
      cors: {},
      auth: {
        ...baseConfig.security.auth,
        secret: 'agent-test-secret'.repeat(5),
        issuer: 'agent-test',
        whiteList: [],
      },
    },
  })
)

@Module({
  imports: [AiAgentModule],
  providers: [
    AppErrorFilter,
    provide(AppConfigService, { useValue: config }),
    provide(BunSQLDatabase, { useValue: db as unknown as BunSQLDatabase }),
  ],
  exports: [AppConfigService, BunSQLDatabase],
  global: true,
})
class AgentTestModule {}

describe('Agent skill selection input', () => {
  test('defaults to no skills and preserves deliberate order', () => {
    expect(aiAgentCreateReqSchema.parse({ name: 'Agent' }).skillIds).toEqual([])
    expect(
      aiAgentCreateReqSchema.parse({ name: 'Agent', skillIds: ['3', '1'] })
        .skillIds
    ).toEqual(['3', '1'])
  })

  test('rejects duplicate, invalid and excessive skill IDs', () => {
    for (const skillIds of [
      ['1', '1'],
      ['0'],
      ['9223372036854775808'],
      Array.from({ length: 51 }, (_, i) => String(i + 1)),
    ]) {
      expect(
        aiAgentCreateReqSchema.safeParse({ name: 'Agent', skillIds }).success
      ).toBe(false)
    }
  })

  test('distinguishes omitted selection from clearing and rejects mass assignment', () => {
    expect(
      aiAgentUpdateBodySchema.parse({ id: '1', name: 'Rename' }).skillIds
    ).toBeUndefined()
    expect(
      aiAgentUpdateBodySchema.parse({ id: '1', skillIds: [] }).skillIds
    ).toEqual([])
    for (const property of [
      'tenantId',
      'ownerUserId',
      'deleted',
      'publishedAt',
    ]) {
      expect(
        aiAgentCreateReqSchema.safeParse({ name: 'Agent', [property]: '1' })
          .success
      ).toBe(false)
    }
    expect(
      aiAgentUpdateBodySchema.safeParse({ id: '1', version: 1 }).success
    ).toBe(false)
  })
})

describe('Agent module HTTP authentication', () => {
  let server: TestServer
  beforeAll(async () => {
    server = await createTestServer({
      modules: AgentTestModule,
      prefix: 'api',
      middleware: [],
      onError: AppErrorFilter,
    })
  })
  afterAll(async () => {
    await server?.close()
  })

  test('requires a session even without global authentication middleware', async () => {
    queries.length = 0
    const response = await server.json('api/ai/agent/getList')
    expect(response.status).toBe(401)
    expect(queries).toHaveLength(0)
  })

  test('resolves module dependencies and restricts authenticated list queries', async () => {
    TokenUtils.setConfig(config)
    const token = await JwtUtils.sign(
      { sub: '10', type: 'access', tenantId: '20', account: 'test' },
      { expiresIn: 60 }
    )
    const response = await server.json('api/ai/agent/getList', {
      headers: { authorization: `Bearer ${token}` },
    })
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ code: 0, data: [] })
    expect(queries.at(-1)).toContain('"owner_user_id"')
    expect(queries.at(-1)).toContain('"tenant_id"')
    expect(queries.at(-1)).toContain('"deleted"')
  })
})
