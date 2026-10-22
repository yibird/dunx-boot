import { Agent } from '@mastra/core/agent'

export const chatAgent = new Agent({
  id: 'chat-agent',
  name: 'Chat Agent',
  description: '通用Agent',
  // 系统提示词
  instructions: 'You are a helpful assistant.',
  model: 'deepseek/deepseek-chat',
  // 子agent
  agents: {},
  // 可重试操作的最大重试次数
  maxRetries: 0,
  // 钩子函数
  hooks: {},
  // 元数据
  metadata: {},
  // skills
  skills: [],
})

// export const xxAgent = new Agent({
//   id: 'xx-agent',
//   name: 'XX Agent',
//   description: 'XX Agent',
//   instructions: 'You are a helpful assistant.',
//   model: {
//     id: 'deepseek/deepseek-chat',
//     url: '',
//     apiKey: '',
//     /**
//      * 采用的 API 类型:
//      * - chat：使用 Chat Completions 风格的接口，通常对应 /chat/completions。
//      * - responses：使用 Responses API 风格的接口，通常对应 /responses。
//      */
//     api: 'chat',
//   },
// })
