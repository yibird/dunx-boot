import { LogLevel } from '@dunx/core'
import { z } from 'zod'

export const log = z.object({
  level: z.enum(LogLevel).default(LogLevel.INFO),
  file: z
    .object({
      path: z.string(),
      interval: z.enum(['daily', 'hourly']),
      maxFiles: z.number().int().positive(),
      bufferBytes: z.number().int().positive(),
      flushIntervalMs: z.number().int(),
    })
    .prefault({
      path: './logs/app.log',
      interval: 'daily',
      maxFiles: 7,
      bufferBytes: 16 * 1024,
      flushIntervalMs: 1000,
    }),
  requestBody: z.boolean().default(false),
  responseBody: z.boolean().default(false),
})
