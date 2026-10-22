import { describe, expect, test } from 'bun:test'
import { aiChatSendReqSchema } from '@/features/ai/chat/session/schema'
import { createOpenAI } from '@ai-sdk/openai'
import { Mastra } from '@mastra/core'
import { Agent } from '@mastra/core/agent'
import { Module, provide } from '@dunx/core'
import { describeRoutes } from '@dunx/openapi'
import { createTestServer } from '@dunx/testing'
import { AppConfigService, configSchema } from '@/infra/config'
import { AppErrorFilter } from '@/infra/http/error-filter'
import { AiChatController } from '@/features/ai/chat/controller'
import { AiChatService } from '@/features/ai/chat/service'
import { AiChatSessionRepository } from '@/features/ai/chat/session/repository'
import baseConfig from '../config/application'

function appConfig() {
  return new AppConfigService(
    configSchema.parse({
      ...baseConfig,
      database: {
        url: 'postgres://test:test@127.0.0.1:1/ai_chat_test',
        cache: false,
      },
      security: {
        ...baseConfig.security,
        cors: {},
        auth: {
          ...baseConfig.security.auth,
          secret: 'test-only-auth-secret'.repeat(3),
        },
      },
    })
  )
}

/**
 * OpenAI 兼容的流式响应：两段文本增量加一个结束块。
 */
function streamResponse(): Response {
  const chunk = (choices: unknown[]) =>
    `data: ${JSON.stringify({
      id: 'mock-response',
      created: 1,
      model: 'mock-model',
      object: 'chat.completion.chunk',
      choices,
    })}\n\n`
  return new Response(
    chunk([
      {
        index: 0,
        delta: { role: 'assistant', content: 'hello ' },
        finish_reason: null,
      },
    ]) +
      chunk([{ index: 0, delta: { content: 'world' }, finish_reason: null }]) +
      chunk([{ index: 0, delta: {}, finish_reason: 'stop' }]) +
      'data: [DONE]\n\n',
    { headers: { 'content-type': 'text/event-stream' } }
  )
}

/** 只替换仓储和 Agent：不碰数据库，模型指向本机假上游。 */
function service(config: AppConfigService, baseURL: string) {
  const repository = {
    getList: async () => [{ id: '1', title: '你好' }],
    getOrCreateSession: async () => ({ id: '1', title: '你好' }),
  }
  const agent = new Agent({
    id: 'chat-agent',
    name: 'Chat Agent',
    instructions: 'You are a helpful assistant.',
    model: createOpenAI({ baseURL, apiKey: 'mock-api-key' }).chat('mock-model'),
    maxRetries: 0,
  })
  return new AiChatService(
    repository as unknown as AiChatSessionRepository,
    new Mastra({ agents: { chat: agent }, logger: false }),
    config
  )
}

describe('AI chat demo', () => {
  test('treats an empty sessionId as "no session"', () => {
    // 空串会直捣 SQL（bigint 语法错误 → 500），必须在边界上归一到「未指定」。
    expect(
      aiChatSendReqSchema.parse({ sessionId: '', content: '你好' }).sessionId
    ).toBeUndefined()
    expect(
      aiChatSendReqSchema.parse({ content: '你好' }).sessionId
    ).toBeUndefined()
    expect(
      aiChatSendReqSchema.parse({ sessionId: '12', content: '你好' }).sessionId
    ).toBe('12')
  })

  test('lists sessions and streams the reply over SSE', async () => {
    const upstream = Bun.serve({
      hostname: '127.0.0.1',
      port: 0,
      fetch: async (request) => {
        expect(new URL(request.url).pathname).toBe('/chat/completions')
        expect(request.headers.get('authorization')).toBe('Bearer mock-api-key')
        const body = (await request.json()) as {
          model: string
          messages: unknown[]
          stream: boolean
        }
        expect(body.model).toBe('mock-model')
        expect(body.stream).toBe(true)
        expect(JSON.stringify(body.messages)).toContain('你好')
        return streamResponse()
      },
    })
    try {
      const config = appConfig()
      const chatService = service(config, `http://127.0.0.1:${upstream.port}`)

      @Module({
        controllers: [AiChatController],
        providers: [
          AppErrorFilter,
          provide(AppConfigService, { useValue: config }),
          provide(AiChatService, { useValue: chatService }),
        ],
      })
      class ChatTestModule {}

      const server = await createTestServer({
        modules: ChatTestModule,
        prefix: 'api',
        middleware: [],
      })
      try {
        const list = await server.json<{ data: { id: string }[] }>(
          'api/ai/chat/getSessionList'
        )
        expect(list.status).toBe(200)
        expect(list.body.data.map((row) => row.id)).toEqual(['1'])

        const sent = await server.request('api/ai/chat/send', {
          method: 'POST',
          json: { content: '你好' },
        })
        expect(sent.status).toBe(200)
        expect(sent.headers.get('content-type')).toContain('text/event-stream')
        const body = await sent.text()
        expect(body).toContain('event: start')
        expect(body).toContain('"sessionId":"1"')
        expect(body).toContain('event: delta')
        expect(body).toContain('hello ')
        expect(body).toContain('world')
        expect(body).toContain('event: done')
        expect(body).not.toContain('event: error')

        expect(
          describeRoutes(ChatTestModule)
            .map((route) => `${route.method} ${route.path}`)
            .sort()
        ).toEqual([
          'GET /ai/chat/getSessionList',
          'POST /ai/chat/createSession',
          'POST /ai/chat/send',
        ])
      } finally {
        await server.close()
      }
    } finally {
      await upstream.stop(true)
    }
  })
})
