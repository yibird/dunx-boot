import {
  Controller,
  Get,
  Post,
  SseStream,
  STREAMS,
  meta,
  type Input,
  type SseEvent,
} from '@dunx/http'
import { ApiDoc } from '@dunx/openapi'
import { ApiStatus } from '@/constants'
import { Api, apiRouteResponse } from '@/infra/model'
import { AiChatService } from './service'
import { aiChatSendReqSchema, aiChatSessionListSchema } from './session'
import { aiChatSessionCreateReqSchema } from './schema'

const routes = {
  list: {
    response: apiRouteResponse(aiChatSessionListSchema),
  },
  create: {
    body: aiChatSessionCreateReqSchema,
    response: apiRouteResponse(),
  },
  send: {
    body: aiChatSendReqSchema,
    status: ApiStatus.OK,
  },
} as const

@ApiDoc({ tags: ['Chat'] })
@Controller('ai/chat')
export class AiChatController {
  constructor(private readonly service: AiChatService) {}

  @ApiDoc({ summary: '获取Chat会话列表' })
  @Get('getSessionList', routes.list)
  async getSessionList() {
    const res = await this.service.getSessionList()
    return Response.json(Api.ok(res))
  }

  @ApiDoc({ summary: '创建会话' })
  @Post('createSession', routes.create)
  async createSession({ body }: Input<typeof routes.create>) {
    const res = await this.service.createSession(body)
    return Response.json(Api.ok(res))
  }

  @ApiDoc({ summary: '发送消息并回复' })
  @meta(STREAMS, true)
  @Post('send', routes.send)
  async sendMessage({ body }: Input<typeof routes.send>) {
    const { sessionId, content } = await this.service.sendMessage(body)
    return SseStream.from(this.#events(sessionId, content.textStream), {
      heartbeatMs: 15_000,
    }).toResponse({ 'X-Accel-Buffering': 'no' })
  }

  /**
   * 把模型的文本流翻译成 SSE 事件。
   *
   * 上游错误的正文可能带请求内容和密钥，只回可读信息。
   */
  async *#events(
    sessionId: string,
    textStream: AsyncIterable<string>
  ): AsyncGenerator<SseEvent> {
    yield { event: 'start', data: { sessionId } }
    try {
      for await (const text of textStream) {
        yield { event: 'delta', data: { text } }
      }
      yield { event: 'done', data: { sessionId } }
    } catch (error) {
      yield {
        event: 'error',
        data: error,
      }
    }
  }
}
