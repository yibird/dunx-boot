import { CacheModule, type CacheOptionsInit } from '@dunx/infra/cache'
import { RedisConnection } from '@dunx/infra/redis'
import { AppConfigService } from '../config'
import { getStore } from './store'

/**
 * 应用级缓存：L1 进程内 + L2 Redis。
 *
 * `global: true` 发布 `Cache` / `CacheStore` / `CacheOptions` 到全应用。
 * `degrade: true` 让 Redis 不可达时读作命中失败而不是抛错，`metrics: true`
 * 记录命中率与耗时。
 *
 * 缓存层由 cache.local.enabled / cache.remote.enabled 分别控制。
 * 数据库查询缓存独立使用本地内存。
 */
export const AppCacheModule: DynamicModule = {
  ...CacheModule.forRootAsync(
    {
      useFactory: (config: AppConfigService, redis: RedisConnection) => {
        const { ttl, prefix } = config.values.cache
        return {
          ttl: ttl,
          prefix: prefix ?? config.values.application.name,
          store: getStore(config.values.cache, redis),
        } as CacheOptionsInit
      },
      inject: [AppConfigService, RedisConnection] as const,
    },
    { metrics: true, degrade: true }
  ),
  global: true,
}
import type { DynamicModule } from '@dunx/core'
