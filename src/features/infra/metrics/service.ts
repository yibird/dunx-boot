import { RuntimeStats } from '@dunx/core'
import { RequestMetrics } from '@dunx/http'
import { CacheMetrics } from '@dunx/infra/cache'
import { RedisMetrics } from '@dunx/infra/redis'
import { QueueMetrics } from '@dunx/infra/queue'
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
    private readonly queueMetrics: QueueMetrics
  ) {}

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
    return {} as SysQueryMetrics
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
