import { z } from 'zod'

const servers = z
  .array(
    z.object({
      url: z.string(),
      description: z.string().optional(),
    })
  )
  .optional()

/**
 * 标签层级：operation 只带叶子标签，父子关系在这里声明一次。
 * 3.1 输出为 `x-tagGroups`（Scalar/Redoc 读取），3.2 落到 Tag 的 `parent`。
 */
const tagGroups = z
  .array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      tags: z.array(z.string()),
    })
  )
  .default([])

export const openapi = z
  .object({
    title: z.string().default('dunx-boot'),
    version: z.string().default('0.1.0'),
    description: z.string().default('启动快速启动器'),
    servers,
    specVersion: z.enum(['3.1.0', '3.2.0']).default('3.1.0'),
    tagGroups,
    path: z.string().default('/docs'),
    jsonPath: z.string().default('/openapi.json'),
  })
  .prefault({})
