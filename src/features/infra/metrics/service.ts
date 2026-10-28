import { RuntimeStats } from '@dunx/core'
import { HealthRegistry, RequestMetrics } from '@dunx/http'
import { CacheMetrics } from '@dunx/infra/cache'
import { RedisMetrics } from '@dunx/infra/redis'
import { QueueMetrics } from '@dunx/infra/queue'
import { QueryMetrics } from '@/infra/db/query-metrics'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { renderOpenMetrics } from './openmetrics'
import type {
  SysCacheMetrics,
  SysMetrics,
  SysQueryMetrics,
  SysQueueMetrics,
  SysRedisMetrics,
  SysRequestMetrics,
  SysRuntimeMetrics,
} from './schema'

/**
 * 系统指标Service层
 */
export class SysMetricsService {
  constructor(
    private readonly metrics: RequestMetrics,
    private readonly runtimeStats: RuntimeStats,
    private readonly cacheMetrics: CacheMetrics,
    private readonly redisMetrics: RedisMetrics,
    private readonly queueMetrics: QueueMetrics,
    private readonly queryMetrics: QueryMetrics,
    private readonly db: BunSQLDatabase,
    private readonly health: HealthRegistry
  ) {}

  /**
   * 渲染 Prometheus / OpenMetrics 文本。
   *
   * 数据库连接数与 readiness 都是异步采集：前者一次 `pg_stat_activity`
   * 聚合查询，后者复用健康检查（DB critical + Redis 非关键）。
   */
  async openMetrics() {
    const [db, health] = await Promise.all([
      this.#dbSnapshot(),
      this.health.readiness(),
    ])
    return renderOpenMetrics({
      request: this.metrics.snapshot(),
      runtime: this.runtimeStats.snapshot(),
      cache: this.cacheMetrics.snapshot(),
      redis: this.redisMetrics.snapshot(),
      queue: this.queueMetrics.snapshot(),
      query: this.queryMetrics.snapshot(),
      db,
      health,
    })
  }

  async #dbSnapshot() {
    try {
      // 注入的 token 类型是 BunSQLDatabase 类；drizzle() 返回值才带 $client。
      const client = (this.db as unknown as { $client: Bun.SQL }).$client
      const connections = (await client`
        select coalesce(state, 'unknown') as state, count(*)::int as count
        from pg_stat_activity
        where datname = current_database()
        group by 1
      `) as unknown as { state: string; count: number }[]
      return { up: true, connections }
    } catch {
      // 指标端点不因为数据库不可达而失败；`dunx_db_up` 会变成 0。
      return {
        up: false,
        connections: [] as { state: string; count: number }[],
      }
    }
  }

  /**
   * 获取请求指标
   *
   * @returns 请求指标
   */
  getRequestMetrics() {
    return this.metrics.snapshot() as SysRequestMetrics
  }

  /**
   * 获取数据库查询指标
   *
   * @returns 数据库查询指标
   */
  getQueryMetrics() {
    return this.queryMetrics.snapshot() as SysQueryMetrics
  }

  /**
   * 获取缓存指标
   *
   * @returns 缓存指标
   */
  getCacheMetrics() {
    return this.cacheMetrics.snapshot() as SysCacheMetrics
  }

  /**
   * 获取Redis指标
   *
   * @returns Redis指标
   */
  getRedisMetrics() {
    return this.redisMetrics.snapshot() as SysRedisMetrics
  }

  /**
   * 获取队列指标
   *
   * @returns 队列指标
   */
  getQueueMetrics() {
    return this.queueMetrics.snapshot() as SysQueueMetrics
  }

  /**
   * 获取运行时指标
   *
   * @returns 运行统指标
   */
  getRuntimeStats() {
    return this.runtimeStats.snapshot() as SysRuntimeMetrics
  }

  /**
   * 获取所有指标信息
   *
   * @returns 指标信息
   */
  getMetrics() {
    return {
      request: this.getRequestMetrics(),
      runtime: this.getRuntimeStats(),
      query: this.getQueryMetrics(),
      cache: this.getCacheMetrics(),
      redis: this.getRedisMetrics(),
      queue: this.getQueueMetrics(),
    } as SysMetrics
  }
}
