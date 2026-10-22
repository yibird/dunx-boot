import { z } from 'zod'

/**
 * OpenTelemetry tracing；没有采集地址时不启动 SDK。
 */
export const tracing = z
  .object({
    enabled: z.boolean().default(true),
    /**
     * OTLP/HTTP 完整接收地址，通常以 `/v1/traces` 结尾。
     */
    endpoint: z.url({ protocol: /^https?$/ }).optional(),
    /**
     * 新 trace 的采样率；已有父 span 时继承父级采样决定。
     */
    sampleRatio: z.number().min(0).max(1).default(1),
    /**
     * 单批导出超时（毫秒），采集服务不可用时也能有界收尾。
     */
    exportTimeoutMs: z.number().int().positive().default(2000),
  })
  .prefault({})
