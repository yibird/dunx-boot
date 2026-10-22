import { and, desc, eq, isNull, type AnyColumn } from 'drizzle-orm'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { DEFAULT_TENANT_ID } from '@/constants'
import { NotFoundError } from '@/errors'
import { sessionContext } from '@/infra/context'
import { mergeAnd } from '@/infra/db'
import { aiChatSession, aiModel, aiModelProvider } from '@/schemas'
import { DateUtils } from '@/utils/date'
import { AiModelType } from '../../model/constant'
import type { AiChatSessionCreateReq } from '../schema'
import type { AiChatSendReq } from './schema'

/**
 * 会话列表与所用模型；按当前用户、租户隔离。
 */
export class AiChatSessionRepository {
  constructor(private readonly db: BunSQLDatabase) {}

  async getList() {
    return this.db
      .select()
      .from(aiChatSession)
      .where(this.scope())
      .orderBy(desc(aiChatSession.lastMessageAt), desc(aiChatSession.id))
  }

  async findById(id: string) {
    const [session] = await this.db
      .select()
      .from(aiChatSession)
      .where(mergeAnd(this.scope(), eq(aiChatSession.id, id)))
      .limit(1)
    return session
  }

  /**
   * 新建会话，标题取首条消息。
   */
  async create(req: AiChatSessionCreateReq) {
    const actor = sessionContext.require()
    const [session] = await this.db
      .insert(aiChatSession)
      .values({
        ownerUserId: actor.userId,
        tenantId: actor.tenantId ?? DEFAULT_TENANT_ID,
        title: req.title.slice(0, 50),
        lastMessageAt: DateUtils.format(new Date()),
        createBy: actor.userId,
        creatorName: actor.account ?? '',
        createdAt: DateUtils.format(new Date()),
      })
      .returning()
    if (!session) throw new Error('创建会话失败')
    return session
  }

  async getOrCreateSession(req: AiChatSendReq) {
    const session =
      typeof req.sessionId === 'string'
        ? await this.findById(req.sessionId)
        : undefined
    return session ?? (await this.create({ title: req.content }))
  }

  /**
   * 取本次提问要用的模型与供应商。
   */
  async getModel(modelId: string) {
    const [model] = await this.db
      .select()
      .from(aiModel)
      .where(
        and(
          eq(aiModel.id, modelId),
          this.tenantScope(aiModel.tenantId),
          eq(aiModel.deleted, false),
          eq(aiModel.dataStatus, true),
          eq(aiModel.modelType, AiModelType.CHAT)
        )
      )
      .limit(1)
    if (!model) throw new NotFoundError('对话模型不存在或已停用')
    const [provider] = await this.db
      .select()
      .from(aiModelProvider)
      .where(
        and(
          eq(aiModelProvider.id, model.providerId),
          this.tenantScope(aiModelProvider.tenantId),
          eq(aiModelProvider.deleted, false),
          eq(aiModelProvider.dataStatus, true)
        )
      )
      .limit(1)
    if (!provider) throw new NotFoundError('模型供应商不存在或已停用')
    return { model, provider }
  }

  private scope() {
    const actor = sessionContext.require()
    return and(
      eq(aiChatSession.ownerUserId, actor.userId),
      this.tenantScope(aiChatSession.tenantId),
      eq(aiChatSession.deleted, false)
    )
  }

  private tenantScope(column: AnyColumn) {
    const { tenantId } = sessionContext.require()
    return tenantId == null ? isNull(column) : eq(column, tenantId)
  }
}
