import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNull,
  or,
  sql,
  type AnyColumn,
  type SQL,
} from 'drizzle-orm'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { DEFAULT_TENANT_ID } from '@/constants'
import { BadRequestError, ConflictError, NotFoundError } from '@/errors'
import { sessionContext } from '@/infra/context'
import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { Pager } from '@/infra/model'
import {
  aiAgent,
  aiAgentSkill,
  aiModel,
  aiSkill,
  type AiAgent,
} from '@/schemas'
import { DateUtils } from '@/utils/date'
import {
  aiAgentCreateReqSchema,
  aiAgentSkillIdsSchema,
  aiAgentUpdateReqSchema,
  type AiAgentCreateReq,
  type AiAgentQuery,
  type AiAgentUpdateReq,
} from './schema'

type AgentDatabase = Pick<BunSQLDatabase, 'select' | 'insert' | 'update'>

const READ_SNAPSHOT = {
  isolationLevel: 'repeatable read',
  accessMode: 'read only',
} as const

/**
 * Agent 配置与技能关联作为一个整体写入，只允许所有者在当前租户内管理。
 */
export class AiAgentRepository {
  constructor(private readonly db: BunSQLDatabase) {}

  async getRecord(id: string) {
    return this.db.transaction(async (tx) => {
      const [agent] = await tx
        .select()
        .from(aiAgent)
        .where(mergeAnd(this.scope(), eq(aiAgent.id, id)))
        .limit(1)
      if (!agent) throw new NotFoundError('Agent 不存在')
      const [result] = await this.withSkills(tx, [agent])
      return result!
    }, READ_SNAPSHOT)
  }

  async getList(query: Partial<AiAgentQuery> = {}) {
    return this.db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(aiAgent)
        .where(this.queryWhere(query))
        .orderBy(asc(aiAgent.sort), desc(aiAgent.id))
      return this.withSkills(tx, rows)
    }, READ_SNAPSHOT)
  }

  async getPageList(query: Partial<AiAgentQuery> = {}) {
    return this.db.transaction(async (tx) => {
      const { pageSize, offset } = Pager.getPagination(query)
      const where = this.queryWhere(query)
      const [rows, totals] = await Promise.all([
        tx
          .select()
          .from(aiAgent)
          .where(where)
          .orderBy(asc(aiAgent.sort), desc(aiAgent.id))
          .limit(pageSize)
          .offset(offset),
        tx.select({ total: count() }).from(aiAgent).where(where),
      ])
      return {
        list: await this.withSkills(tx, rows),
        total: totals[0]?.total ?? 0,
      }
    }, READ_SNAPSHOT)
  }

  async create(input: AiAgentCreateReq) {
    const parsed = aiAgentCreateReqSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestError('Agent 创建参数不合法')
    return this.db.transaction(async (tx) => {
      const { skillIds: ids, ...values } = parsed.data
      await this.validateSkills(tx, ids)
      if (values.modelId) await this.validateModel(tx, values.modelId)
      const actor = sessionContext.require()
      const [agent] = await tx
        .insert(aiAgent)
        .values({
          ...values,
          ownerUserId: actor.userId,
          tenantId: actor.tenantId ?? DEFAULT_TENANT_ID,
          ...this.createAudit(),
        })
        .returning()
      if (!agent) throw new Error('创建 Agent 失败')
      await this.replaceSkills(tx, agent.id, ids)
      return { ...agent, skillIds: ids }
    })
  }

  async update(id: string, input: AiAgentUpdateReq) {
    const parsed = aiAgentUpdateReqSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestError('Agent 更新参数不合法')
    return this.db.transaction(async (tx) => {
      const agent = await this.lockAgent(tx, id)
      const { skillIds, version, ...values } = parsed.data
      if (version !== undefined && version !== agent.version) {
        throw new ConflictError('Agent 已被修改，请刷新后重试')
      }
      if (skillIds !== undefined) await this.validateSkills(tx, skillIds)
      if (values.modelId) await this.validateModel(tx, values.modelId)
      const [updated] = await tx
        .update(aiAgent)
        .set({
          ...values,
          ...this.updateAudit(),
          version: sql`${aiAgent.version} + 1`,
        })
        .where(mergeAnd(this.scope(), eq(aiAgent.id, id)))
        .returning()
      if (!updated) throw new NotFoundError('Agent 不存在')
      if (skillIds !== undefined) await this.replaceSkills(tx, id, skillIds)
      const [result] = await this.withSkills(tx, [updated])
      return result!
    })
  }

  async delete(id: string) {
    return this.db.transaction(async (tx) => {
      const agent = await this.lockAgent(tx, id)
      const [result] = await this.withSkills(tx, [agent])
      const deleted = this.deleteAudit()
      await tx.update(aiAgentSkill).set(deleted).where(this.bindingScope(id))
      const [row] = await tx
        .update(aiAgent)
        .set({
          ...deleted,
          version: sql`${aiAgent.version} + 1`,
        })
        .where(mergeAnd(this.scope(), eq(aiAgent.id, id)))
        .returning()
      if (!row) throw new NotFoundError('Agent 不存在')
      return { ...row, skillIds: result!.skillIds }
    })
  }

  private async lockAgent(db: AgentDatabase, id: string) {
    const [agent] = await db
      .select()
      .from(aiAgent)
      .where(mergeAnd(this.scope(), eq(aiAgent.id, id)))
      .for('update')
      .limit(1)
    if (!agent) throw new NotFoundError('Agent 不存在')
    return agent
  }

  private async validateSkills(db: AgentDatabase, ids: string[]) {
    const validated = aiAgentSkillIdsSchema.safeParse(ids)
    if (!validated.success)
      throw new BadRequestError('技能 ID 必须唯一且最多 50 个')
    if (ids.length === 0) return
    const actor = sessionContext.require()
    const skills = await db
      .select({ id: aiSkill.id })
      .from(aiSkill)
      .where(
        and(
          inArray(aiSkill.id, ids),
          eq(aiSkill.deleted, false),
          eq(aiSkill.dataStatus, true),
          this.tenantScope(aiSkill.tenantId),
          or(
            eq(aiSkill.ownerUserId, actor.userId),
            eq(aiSkill.visibility, 'public')
          )
        )
      )
      .orderBy(asc(aiSkill.id))
      .for('share')
    if (skills.length !== ids.length) {
      throw new BadRequestError('所选技能不存在、不可访问或已禁用')
    }
  }

  private async validateModel(db: AgentDatabase, id: string) {
    const [model] = await db
      .select({ id: aiModel.id })
      .from(aiModel)
      .where(
        and(
          eq(aiModel.id, id),
          this.tenantScope(aiModel.tenantId),
          eq(aiModel.deleted, false),
          eq(aiModel.dataStatus, true),
          eq(aiModel.modelType, 'chat')
        )
      )
      .for('share')
      .limit(1)
    if (!model) throw new BadRequestError('所选对话模型不存在或不可用')
  }

  private async replaceSkills(
    db: AgentDatabase,
    agentId: string,
    ids: string[]
  ) {
    await db
      .update(aiAgentSkill)
      .set(this.deleteAudit())
      .where(this.bindingScope(agentId))
    if (ids.length === 0) return
    const actor = sessionContext.require()
    await db.insert(aiAgentSkill).values(
      ids.map((skillId, sort) => ({
        agentId,
        skillId,
        sort,
        tenantId: actor.tenantId ?? DEFAULT_TENANT_ID,
        ...this.createAudit(),
      }))
    )
  }

  private async withSkills(db: AgentDatabase, agents: AiAgent[]) {
    if (agents.length === 0) return []
    const bindings = await db
      .select({
        agentId: aiAgentSkill.agentId,
        skillId: aiAgentSkill.skillId,
      })
      .from(aiAgentSkill)
      .where(
        and(
          inArray(
            aiAgentSkill.agentId,
            agents.map((agent) => agent.id)
          ),
          eq(aiAgentSkill.deleted, false),
          this.tenantScope(aiAgentSkill.tenantId)
        )
      )
      .orderBy(asc(aiAgentSkill.sort), asc(aiAgentSkill.id))
    const byAgent = new Map<string, string[]>()
    for (const binding of bindings) {
      const ids = byAgent.get(binding.agentId) ?? []
      ids.push(binding.skillId)
      byAgent.set(binding.agentId, ids)
    }
    return agents.map((agent) => ({
      ...agent,
      skillIds: byAgent.get(agent.id) ?? [],
    }))
  }

  private scope(): SQL | undefined {
    const actor = sessionContext.require()
    return and(
      eq(aiAgent.ownerUserId, actor.userId),
      this.tenantScope(aiAgent.tenantId),
      eq(aiAgent.deleted, false)
    )
  }

  private tenantScope(column: AnyColumn) {
    const actor = sessionContext.require()
    return actor.tenantId == null ? isNull(column) : eq(column, actor.tenantId)
  }

  private bindingScope(agentId: string) {
    return and(
      eq(aiAgentSkill.agentId, agentId),
      eq(aiAgentSkill.deleted, false),
      this.tenantScope(aiAgentSkill.tenantId)
    )
  }

  private queryWhere(query: Partial<AiAgentQuery>) {
    return mergeAnd(
      this.scope(),
      ilikeIf(aiAgent.name, query.name),
      eqIf(aiAgent.modelId, query.modelId),
      eqIf(aiAgent.visibility, query.visibility),
      eqIf(aiAgent.dataStatus, query.dataStatus)
    )
  }

  private createAudit() {
    const actor = sessionContext.require()
    return { createBy: actor.userId, creatorName: actor.account ?? null }
  }

  private updateAudit() {
    const actor = sessionContext.require()
    return {
      updateBy: actor.userId,
      updaterName: actor.account ?? null,
      updatedAt: DateUtils.format(new Date()),
    }
  }

  private deleteAudit() {
    const actor = sessionContext.require()
    return {
      deleted: true,
      deleteBy: actor.userId,
      deleterName: actor.account ?? null,
      deletedAt: DateUtils.format(new Date()),
    }
  }
}
