import { AppError, ServiceUnavailableError } from '@/errors'
import { AppConfigService } from '@/infra/config'
// 必须是值导入：容器按构造参数上的类解析依赖，`import type` 会在运行时被擦除。
import { Mastra } from '@mastra/core'
import { AiChatSessionRepository } from './session/repository'
import { AssertUtils } from '@/utils'
import type { AiChatSendReq } from './session/schema'
import type { AiChatSessionCreateReq } from './schema'

export class AiChatService {
  constructor(
    private readonly chatSessionRepo: AiChatSessionRepository,
    private readonly mastra: Mastra,
    private readonly config: AppConfigService
  ) {}

  /**
   * 获取会话列表
   */
  getSessionList() {
    return this.chatSessionRepo.getList()
  }

  async createSession(req: AiChatSessionCreateReq) {
    return this.chatSessionRepo.create(req)
  }

  /**
   * 发送消息并获取大模型回复；消息暂不落库，sessionId 缺省时新建会话。
   */
  async sendMessage(req: AiChatSendReq) {
    const session = await this.chatSessionRepo.getOrCreateSession(req)
    const agent = this.mastra.getAgent('chat')
    AssertUtils.notNull(agent, '未配置Agent')
    try {
      // 流式输出
      const stream = await agent.stream(req.content)
      return { sessionId: session.id, content: stream }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServiceUnavailableError('模型生成失败，请稍后重试')
    }
  }
}
