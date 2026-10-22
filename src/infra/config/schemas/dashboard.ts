import { z } from 'zod'

/**
 * 运维面板配置（`@dunx/dashboard`）。
 */
export const dashboard = z.object({
  /**
   * 是否允许访问；关闭时面板路径统一返回 404
   */
  enabled: z.coerce.boolean().default(true),
  /**
   * 挂载路径（不在全局前缀 `api` 之下）
   */
  path: z.string().default('/_dunx'),
  /**
   * 页面标题
   */
  title: z.string().default('dunx-boot'),
  /**
   * 访问密钥；非空时请求需携带 `x-dashboard-key`
   */
  token: z.string().default(''),
})
