import { Mastra } from '@mastra/core'
import { tools } from './tools'
import { agents } from './agents'

/**
 * 应用共享的 Mastra 实例
 */
export const mastra = new Mastra({
  tools,
  agents,
})
