import { DatabaseIndicator, HealthModule, MemoryOptions } from '@dunx/http'
import { RedisConnection } from '@dunx/infra/redis'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { AppConfigService } from '../config'
import { DbPingProbe } from './database-probe'
import { AppMemoryIndicator } from './memory-indicator'
import { AppRedisIndicator } from './redis-indicator'

import type { DynamicModule } from '@dunx/core'
import type { DbSchema } from '../db/db'

/**
 * 健康检查：挂载 `/api/health/live` 与 `/api/health/ready`。
 *
 * - liveness：内存 RSS 上限（critical，超限返回 503 让编排重启）；
 * - readiness：数据库往返（critical）+ Redis（非关键，缺失不摘流量）。
 *
 * `documented: false` 让探针路由不进 OpenAPI 文档；
 * `global: true` 让 `Readiness` / `HealthRegistry` 在业务模块里也注入得到
 * （框架自己不加，导出了却拿不到）。
 */
export const AppHealthModule: DynamicModule = {
  ...HealthModule.forRootAsync({
    useFactory: (
      config: AppConfigService,
      db: BunSQLDatabase<DbSchema>,
      redis: RedisConnection
    ) => ({
      liveness: [
        new AppMemoryIndicator(
          new MemoryOptions({
            maxRssBytes: config.values.health.memoryMaxRssBytes,
          })
        ),
      ],
      readiness: [
        new DatabaseIndicator(new DbPingProbe(db)),
        new AppRedisIndicator(redis),
      ],
      timeoutMs: config.values.health.timeoutMs,
      drainDelayMs: config.values.health.drainDelayMs,
    }),
    inject: [AppConfigService, BunSQLDatabase, RedisConnection] as const,
    documented: false,
  }),
  global: true,
}
