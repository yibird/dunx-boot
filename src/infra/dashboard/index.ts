import type { DynamicModule } from '@dunx/core'
import { DashboardModule } from '@dunx/dashboard'
import { RequestMetrics } from '@dunx/http'
import { CacheMetrics } from '@dunx/infra/cache'
import { RedisConnection } from '@dunx/infra/redis'
import { AppConfigService, isDev } from '../config'

/**
 * 运维面板：配置、路由、数据库、缓存、Redis 与请求指标。
 *
 * 挂载路径来自 `dashboard.path`（不在 `/api` 前缀下）；`dashboard.enabled`
 * 关闭时该路径统一 404；`dashboard.token` 非空时要求 `x-dashboard-key`。
 * `DashboardMiddleware` 需要在全局中间件里注册（见 `src/middleware/index.ts`）。
 *
 * **没有 token 时只有开发环境放行**：面板会列出路由表、配置键名与各项指标，
 * 不带凭据就开门等于把它挂在公网上。`reveal` 不配置，框架默认不显示任何配置值。
 */
export const AppDashboardModule: DynamicModule = {
  ...DashboardModule.forRootAsync({
    useFactory: (
      config: AppConfigService,
      redis: RedisConnection,
      stats: RequestMetrics,
      cacheStats: CacheMetrics
    ) => {
      const { enabled, path, title, token } = config.values.dashboard
      return {
        path,
        title,
        authorize: (req) => {
          if (!enabled) return false
          if (!token) return isDev()
          return req.headers.get('x-dashboard-key') === token
        },
        redis,
        stats,
        cacheStats,
        config,
      }
    },
    inject: [
      AppConfigService,
      RedisConnection,
      RequestMetrics,
      CacheMetrics,
    ] as const,
  }),
  global: true,
}
