import { z } from 'zod'

/**
 * 请求日志治理配置（`sys_request_log`）。
 */
export const requestLog = z
  .object({
    /**
     * 保留天数；`@Cron` 每天清理更早的记录。
     */
    retentionDays: z.coerce.number().int().positive().default(30),
    /**
     * 采样率（0–1）。1 表示全量记录；0 表示不记录。
     * 只影响审计日志，不影响请求指标。
     */
    sampleRate: z.coerce.number().min(0).max(1).default(1),
    /**
     * 慢请求阈值（毫秒）；超过时打一条 warn，带 traceId。
     */
    slowMs: z.coerce.number().int().positive().default(1000),
  })
  .prefault({})
