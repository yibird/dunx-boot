import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { DateUtils } from '@/utils'

const DEFAULT_TIME_ZONE = 'Asia/Shanghai'

/**
 * 获取指定时区的当前时间。
 *
 * 这是一个无外部依赖的示例工具，既可以被 Demo Agent 调用，
 * 也可以作为 workflow step 单独复用。
 */
export const currentTimeTool = createTool({
  id: 'get-current-time',
  description: '获取指定 IANA 时区的当前时间。',
  inputSchema: z.object({
    timeZone: z.string().min(1).default(DEFAULT_TIME_ZONE),
  }),
  outputSchema: z.object({
    timeZone: z.string(),
    iso: z.string(),
    formatted: z.string(),
    unixSeconds: z.number(),
  }),
  execute: async ({ timeZone }) => {
    const iso = DateUtils.nowIso()
    return {
      timeZone,
      iso,
      formatted: new Intl.DateTimeFormat('zh-CN', {
        dateStyle: 'full',
        timeStyle: 'long',
        timeZone,
      }).format(),
      unixSeconds: DateUtils.nowUnix(),
    }
  },
})
