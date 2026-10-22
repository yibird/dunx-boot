import {
  MemoryCacheStore,
  RedisCacheStore,
  TieredCacheStore,
} from '@dunx/infra/cache'
import type { RedisConnection } from '@dunx/infra/redis'
import type { CacheConfig } from '../config'

export function getStore(config: CacheConfig, redis: RedisConnection) {
  const { local, remote } = config
  if (local.enabled && remote.enabled) {
    return new TieredCacheStore(
      new MemoryCacheStore({ max: local.max }),
      new RedisCacheStore(redis)
    )
  }
  if (local.enabled) {
    return new MemoryCacheStore({ max: local.max })
  }
  if (remote.enabled) {
    return new RedisCacheStore(redis)
  }
}
