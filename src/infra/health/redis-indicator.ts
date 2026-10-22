import { RedisIndicator } from '@dunx/http'

/**
 * Redis 探针。
 *
 * 非关键：应用在 Redis 缺失时降级运行（缓存 miss、限流放行、relay 本地），
 * 因此 Redis down 只上报、不把实例摘出流量。
 */
export class AppRedisIndicator extends RedisIndicator {
  override readonly critical = false
}
