import type { DynamicModule } from '@dunx/core'
import { ClientAddress, RedisThrottleStore, ThrottleModule } from '@dunx/http'
import { RedisConnection } from '@dunx/infra/redis'
import { sessionContext } from '../context'
import { AppConfigService } from '../config'

/**
 * 固定窗口限流（多实例共享 Redis 计数）。
 *
 * `ThrottleModule` 自身是全局模块；还需要在全局中间件里注册 `ThrottleGuard`
 * 才会生效（见 `src/middleware/index.ts`）。计数不可达时放行，不会因为
 * Redis 故障把降级变成宕机。
 *
 * `subject` 按「登录用户 → 客户端地址」取：只按地址计数的话，`trustProxy`
 * 关着时反代后的所有请求都是同一个地址，全站会共用一个桶。
 * `ThrottleGuard` 排在认证中间件之后，所以这里读得到当前主体。
 */
export const AppThrottleModule: DynamicModule = ThrottleModule.forRootAsync({
  useFactory: (
    config: AppConfigService,
    redis: RedisConnection,
    address: ClientAddress
  ) => {
    const { throttle } = config.values.resilience
    return {
      limit: throttle.limit,
      windowSeconds: throttle.windowSeconds,
      prefix: config.values.application.name,
      headers: throttle.headers,
      store: new RedisThrottleStore(redis),
      subject: (req) => sessionContext.get()?.userId ?? address.of(req),
    }
  },
  inject: [AppConfigService, RedisConnection, ClientAddress] as const,
})
