import { z } from 'zod'

/**
 *  HTTP 服务器（Bun.serve）配置 schema。
 */
export const server = z.object({
  /**
   * 监听端口。
   */
  port: z.number().int().min(1).max(65535).default(3000),
  /**
   * 连接的 HTTP 空闲超时（秒），Bun.serve 上限 255；0 表示不超时。
   */
  idleTimeout: z.number().int().min(0).max(255).default(30),
  /**
   * 所有路由的统一前缀（`HttpOptionsProvider.prefix`）；空串表示无前缀。
   */
  basePath: z.string().default('api'),
  /**
   * 单个请求体的上限（字节），按 `Content-Length` 在进入认证前拒绝。
   * `0` 表示不限制。文件上传（`/api/files`）走流式分片，不受此限制。
   */
  maxRequestBodyBytes: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(10 * 1024 * 1024),
  /**
   * 是否信任反向代理写入的客户端 IP 请求头。
   */
  trustProxy: z.coerce.boolean().default(false),
})
