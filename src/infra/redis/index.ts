import { RedisModule, type RedisOptionsInit } from '@dunx/infra/redis'
import { AppConfigService } from '../config'

/**
 * 全局 Redis 连接，供缓存、限流和健康检查共用。
 */
export const AppRedisModule: DynamicModule = {
  ...RedisModule.forRootAsync({
    useFactory: (config: AppConfigService) => {
      return config.values.redis as RedisOptionsInit
    },
    inject: [AppConfigService] as const,
  }),
  global: true,
}
import type { DynamicModule } from '@dunx/core'
