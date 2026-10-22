import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  spyOn,
  test,
} from 'bun:test'
import { Module, provide } from '@dunx/core'
import { describeRoutes, generateDocument } from '@dunx/openapi'
import { createTestServer, type TestServer } from '@dunx/testing'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { drizzle } from 'drizzle-orm/pg-proxy'
import { getTableColumns } from 'drizzle-orm'
import { AppConfigService, configSchema } from '@/infra/config'
import { sessionContext } from '@/infra/context'
import { AppErrorFilter } from '@/infra/http/error-filter'
import { aiSkill } from '@/schemas'
import { JwtUtils } from '@/utils/jwt'
import { TokenUtils } from '@/utils/token'
import { AiSkillController } from '@/features/ai/skill/controller'
import { AiSkillRepository } from '@/features/ai/skill/repository'
import { AiSkillService } from '@/features/ai/skill/service'
import baseConfig from '../config/application'

type Query = { sql: string; params: unknown[] }
type ResponseBody = { code: number; data: unknown }
const queries: Query[] = []
let resultRows: unknown[][] = []
const db = drizzle(async (sql, params) => {
  queries.push({ sql, params })
  return { rows: sql.includes('count(*)') ? [[0]] : resultRows }
})
const config = new AppConfigService(
  configSchema.parse({
    ...baseConfig,
    database: { url: 'postgres://test:test@127.0.0.1:1/skill_test' },
    security: {
      ...baseConfig.security,
      cors: {},
      auth: {
        ...baseConfig.security.auth,
        secret: 'skill-module-isolated-test-secret'.repeat(2),
        issuer: 'skill-module-test',
        whiteList: ['/**'],
      },
    },
  })
)

@Module({
  controllers: [AiSkillController],
  providers: [
    AiSkillRepository,
    AiSkillService,
    AppErrorFilter,
    provide(AppConfigService, { useValue: config }),
    provide(BunSQLDatabase, { useValue: db as unknown as BunSQLDatabase }),
  ],
})
class SkillTestModule {}

const skill = {
  id: '100',
  ownerUserId: '10',
  tenantId: '20',
  name: '校对',
  description: null,
  content: '请检查语法与错别字。',
  visibility: 'private',
  dataStatus: true,
  remark: null,
  version: 1,
  sort: 0,
  deleted: false,
  createBy: '10',
  createdAt: '2026-10-13 12:00:00',
  creatorName: 'tester',
  updateBy: null,
  updatedAt: null,
  updaterName: '',
  deleteBy: null,
  deletedAt: null,
  deleterName: null,
} satisfies typeof aiSkill.$inferSelect

function returnSkill() {
  resultRows = [
    Object.keys(getTableColumns(aiSkill)).map(
      (key) => skill[key as keyof typeof skill]
    ),
  ]
}

function boundValue(query: Query, column: string) {
  const match = query.sql.match(new RegExp(`"${column}" = \\$(\\d+)`))
  expect(match).not.toBeNull()
  return query.params[Number(match?.[1]) - 1]
}

async function headers(claims: Record<string, unknown> = {}) {
  const token = await JwtUtils.sign(
    { sub: '10', type: 'access', tenantId: '20', account: 'tester', ...claims },
    { expiresIn: 60 }
  )
  return { authorization: `Bearer ${token}` }
}

let server: TestServer
beforeAll(async () => {
  server = await createTestServer({
    modules: SkillTestModule,
    prefix: 'api',
    middleware: [],
    onError: AppErrorFilter,
  })
})
afterAll(async () => {
  await server?.close()
})
beforeEach(() => {
  queries.length = 0
  resultRows = []
  TokenUtils.setConfig(config)
})

describe('Skill authentication and isolation', () => {
  test('requires a valid access token for CRUD and available routes with global auth disabled', async () => {
    for (const route of ['getList', 'available']) {
      expect((await server.json(`api/ai/skill/${route}`)).status).toBe(401)
      expect(
        (
          await server.json(`api/ai/skill/${route}`, {
            headers: await headers({ type: 'refresh' }),
          })
        ).status
      ).toBe(401)
    }
    expect(queries).toHaveLength(0)
  })

  test('applies owner, tenant and soft-delete scope to lists, including NULL tenant', async () => {
    for (const tenantId of ['20', undefined]) {
      const response = await server.json('api/ai/skill/getList', {
        headers: await headers({ tenantId }),
      })
      expect(response.status).toBe(200)
      const query = queries.at(-1)!
      expect(boundValue(query, 'owner_user_id')).toBe('10')
      expect(boundValue(query, 'deleted')).toBe(false)
      if (tenantId) expect(boundValue(query, 'tenant_id')).toBe(tenantId)
      else expect(query.sql).toContain('"tenant_id" is null')
      expect(sessionContext.get()).toBeUndefined()
    }
  })

  test('available includes only enabled, live, same-tenant own or public skills and never selects content', async () => {
    resultRows = [['101', '公开校对', null, 'public', '11']]
    const response = await server.json<ResponseBody>(
      'api/ai/skill/available?name=校对&pageSize=5&current=2',
      { headers: await headers() }
    )
    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      list: [
        {
          id: '101',
          name: '公开校对',
          visibility: 'public',
          ownerUserId: '11',
        },
      ],
      current: 2,
      pageSize: 5,
    })
    expect(JSON.stringify(response.body)).not.toContain('content')
    expect(queries).toHaveLength(2)
    for (const query of queries) {
      expect(boundValue(query, 'tenant_id')).toBe('20')
      expect(boundValue(query, 'owner_user_id')).toBe('10')
      expect(boundValue(query, 'visibility')).toBe('public')
      expect(boundValue(query, 'data_status')).toBe(true)
      expect(boundValue(query, 'deleted')).toBe(false)
      expect(query.sql).toContain(' or ')
      expect(query.sql).not.toContain('"content"')
      expect(query.params).toContain('%校对%')
    }
  })

  test('does not allow public availability to bypass ownership on read or update', async () => {
    const requestHeaders = await headers()
    expect(
      (
        await server.json('api/ai/skill/getRecord?id=100', {
          headers: requestHeaders,
        })
      ).status
    ).toBe(404)
    expect(
      (
        await server.json('api/ai/skill/update', {
          method: 'POST',
          headers: requestHeaders,
          json: { id: '100', content: 'changed', version: 10 },
        })
      ).status
    ).toBe(404)
    expect(queries).toHaveLength(2)
    for (const query of queries)
      expect(boundValue(query, 'owner_user_id')).toBe('10')
  })
})

describe('Skill CRUD validation', () => {
  test.each([
    { name: '校对' },
    { name: ' ', content: '文字' },
    { name: '校对', content: '   ' },
    { name: '校对', content: 'a'.repeat(50_001) },
    { name: '校对', content: '文字', visibility: 'global' },
    { name: '校对', content: '文字', description: 'a'.repeat(501) },
  ])('rejects invalid skill content and fields %#', async (json) => {
    expect(
      (
        await server.json('api/ai/skill/create', {
          method: 'POST',
          headers: await headers(),
          json,
        })
      ).status
    ).toBe(400)
    expect(queries).toHaveLength(0)
  })

  test.each(['ownerUserId', 'tenantId', 'id', 'deleted', 'createBy'])(
    'rejects server-owned %s',
    async (field) => {
      expect(
        (
          await server.json('api/ai/skill/create', {
            method: 'POST',
            headers: await headers(),
            json: {
              name: '校对',
              content: '文字',
              [field]: field === 'deleted' ? true : '999',
            },
          })
        ).status
      ).toBe(400)
      expect(queries).toHaveLength(0)
    }
  )

  test('creates a skill with authenticated owner and tenant', async () => {
    returnSkill()
    const response = await server.json<ResponseBody>('api/ai/skill/create', {
      method: 'POST',
      headers: await headers(),
      json: { name: '校对', content: '请检查语法与错别字。' },
    })
    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: '100',
      ownerUserId: '10',
      tenantId: '20',
      content: skill.content,
    })
    expect(queries[0]!.sql).toStartWith('insert into "ai_skill"')
    expect(queries[0]!.params).toContain('10')
    expect(queries[0]!.params).toContain('20')
  })

  test('protects ownership and audit when repository callers bypass HTTP validation', async () => {
    returnSkill()
    await sessionContext.run(
      { userId: '10', tenantId: '20', account: 'tester' },
      () =>
        server.app.get(AiSkillRepository).create({
          name: '校对',
          content: '文字',
          id: '999',
          ownerUserId: '999',
          tenantId: '999',
          deleted: true,
          version: 999,
          createBy: '999',
        })
    )
    expect(queries[0]!.params).not.toContain('999')
    expect(queries[0]!.params).not.toContain(999)
    expect(queries[0]!.params).not.toContain(true)
  })

  test('updates using flat bodies and scoped optimistic locking', async () => {
    returnSkill()
    expect(
      (
        await server.json('api/ai/skill/update', {
          method: 'POST',
          headers: await headers(),
          json: { id: '100', name: '新名', version: 1 },
        })
      ).status
    ).toBe(200)
    const query = queries[1]!
    expect(query.sql).toStartWith('update "ai_skill"')
    expect(boundValue(query, 'owner_user_id')).toBe('10')
    expect(boundValue(query, 'tenant_id')).toBe('20')
    expect(boundValue(query, 'version')).toBe(1)
    expect(query.sql).toContain('"version" + 1')
  })

  test('rejects empty updates and malformed IDs before reaching SQL', async () => {
    for (const json of [
      { id: '100' },
      { id: '100', version: 1 },
      { id: '9223372036854775808', content: '文字' },
    ]) {
      expect(
        (
          await server.json('api/ai/skill/update', {
            method: 'POST',
            headers: await headers(),
            json,
          })
        ).status
      ).toBe(400)
    }
    expect(
      (
        await server.json('api/ai/skill/getRecord?id=abc', {
          headers: await headers(),
        })
      ).status
    ).toBe(400)
    expect(queries).toHaveLength(0)
  })

  test('always requests a scoped soft delete and returns 404 for an inaccessible record', async () => {
    const repository = server.app.get(AiSkillRepository)
    const safeDelete = spyOn(repository, 'safeDelete').mockResolvedValue(
      undefined
    )
    try {
      expect(
        (
          await server.json('api/ai/skill/delete', {
            method: 'POST',
            headers: await headers(),
            json: { id: '100' },
          })
        ).status
      ).toBe(404)
      expect(safeDelete).toHaveBeenCalledWith('100', true)
    } finally {
      safeDelete.mockRestore()
    }
  })

  test('exposes six CRUD routes plus available and excludes bulk operations', async () => {
    const { document, warnings } = await generateDocument(
      describeRoutes(SkillTestModule),
      { title: 'Skill test', version: '1' }
    )
    expect(
      warnings.filter(
        (warning) =>
          !warning.startsWith(
            'Two different schemas are both named "ApiResponse".'
          )
      )
    ).toEqual([])
    expect(Object.keys(document.paths)).toHaveLength(7)
    expect(Object.keys(document.paths)).toContain('/ai/skill/available')
    expect(Object.keys(document.paths)).not.toContain('/ai/skill/createMany')
    expect(document.components?.schemas).toHaveProperty('AiSkillCreateReq')
  })
})
