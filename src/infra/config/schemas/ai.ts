import { z } from 'zod'

/**
 * 模型请求总时限及供应商凭证加密密钥。
 */
export const ai = z
  .object({
    credentialSecret: z.string().min(32).optional(),
    requestTimeoutMs: z.number().int().min(1000).max(300_000).default(120_000),
  })
  .prefault({})
