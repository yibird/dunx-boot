import { describe, expect, expectTypeOf, test } from 'bun:test'
import { drizzle } from 'drizzle-orm/bun-sql/postgres'
import { appSchema, relations, sysRole, aiModelProvider } from '@/schemas'

const db = drizzle.mock({ relations })

describe('database relations', () => {
  test('preserves nullable user roles and nested reverse relations', () => {
    const users = db.query.sysUser.findMany({ with: { role: true } })
    type User = Awaited<typeof users>[number]
    expectTypeOf<User['role']>().toEqualTypeOf<
      typeof sysRole.$inferSelect | null
    >()

    const query = db.query.sysRole.findMany({
      columns: { id: true },
      with: {
        users: {
          columns: { id: true },
          with: { authIdentities: { columns: { id: true } } },
        },
      },
    })
    const { sql } = query.toSQL()
    expect(sql).toContain('"d0"."id" = "d1"."role_id"')
    expect(sql).toContain('"d1"."id" = "d2"."user_id"')
  })

  test('keeps embedding and rerank model relations distinct in both directions', () => {
    const models = db.query.aiModel.findMany({
      columns: { id: true },
      with: {
        provider: true,
        embeddingKnowledgeBases: { columns: { id: true } },
        rerankKnowledgeBases: { columns: { id: true } },
      },
    })
    type Model = Awaited<typeof models>[number]
    expectTypeOf<Model['provider']>().toEqualTypeOf<
      typeof aiModelProvider.$inferSelect
    >()
    expect(models.toSQL().sql).toContain(
      '"d0"."id" = "d1"."embedding_model_id"'
    )
    expect(models.toSQL().sql).toContain('"d0"."id" = "d1"."rerank_model_id"')

    const bases = db.query.aiKnowledgeBase.findMany({
      columns: { id: true },
      with: {
        embeddingModel: { columns: { id: true } },
        rerankModel: { columns: { id: true } },
      },
    })
    expect(bases.toSQL().sql).toContain('"d0"."embedding_model_id" = "d1"."id"')
    expect(bases.toSQL().sql).toContain('"d0"."rerank_model_id" = "d1"."id"')
  })

  test('preserves self-referencing chat and agent message parents', () => {
    const chatMessages = db.query.aiChatMessage.findMany({
      columns: { id: true },
      with: { parent: { columns: { id: true } } },
    })
    const agentMessages = db.query.aiAgentMessage.findMany({
      columns: { id: true },
      with: { parent: { columns: { id: true } } },
    })
    expect(chatMessages.toSQL().sql).toContain('"d0"."parent_id" = "d1"."id"')
    expect(agentMessages.toSQL().sql).toContain('"d0"."parent_id" = "d1"."id"')
  })

  test('exposes tables without relations and the existing appSchema alias', () => {
    expect(appSchema).toBe(relations)
    expect(db.query.sysTenant.findMany().toSQL().sql).toContain(
      'from "sys_tenant"'
    )
  })
})
