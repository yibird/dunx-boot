import type { HistogramSnapshot, RuntimeReport } from '@dunx/core'
import type { HealthReport, HttpStatsReport } from '@dunx/http'
import type { CacheStatsReport } from '@dunx/infra/cache'
import type { DbStatsReport } from '@/infra/db/query-metrics'
import type { QueueStatsReport } from '@dunx/infra/queue'
import type { RedisStatsReport } from '@dunx/infra/redis'

/**
 * OpenMetrics 渲染需要的数据；全部来自各监控组件的快照。
 *
 * 所有耗时在框架侧都是**纳秒**，这里统一换算成秒。
 */
export interface OpenMetricsInput {
  request: HttpStatsReport
  runtime: RuntimeReport
  cache: CacheStatsReport
  redis: RedisStatsReport
  queue: QueueStatsReport
  query: DbStatsReport
  db: {
    up: boolean
    connections: readonly { state: string; count: number }[]
  }
  health: HealthReport
}

const escapeLabel = (value: string) =>
  value.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('\n', '\\n')

const labels = (entries: Record<string, string | number>) => {
  const parts = Object.entries(entries).map(
    ([key, value]) => `${key}="${escapeLabel(String(value))}"`
  )
  return parts.length > 0 ? `{${parts.join(',')}}` : ''
}

const num = (value: number) => {
  if (!Number.isFinite(value)) return '0'
  return String(Number(value.toFixed(6)))
}

const seconds = (nanoseconds: number) => num(nanoseconds / 1e9)

/**
 * 把快照渲染成 Prometheus 0.0.4 / OpenMetrics 文本。
 *
 * 分位数以 gauge 形式输出（`quantile` 标签），因为框架的直方图快照只保留
 * 分位数与计数、没有 `_sum`；告警直接比较分位数值即可，不需要 histogram_quantile。
 */
export function renderOpenMetrics(input: OpenMetricsInput): string {
  const lines: string[] = []
  const metric = (name: string, type: 'counter' | 'gauge', help: string) =>
    lines.push(`# HELP ${name} ${help}`, `# TYPE ${name} ${type}`)
  const sample = (name: string, labelText: string, value: string | number) =>
    lines.push(`${name}${labelText} ${value}`)
  const quantiles = (
    name: string,
    histogram: HistogramSnapshot,
    extra: Record<string, string | number> = {}
  ) => {
    const points: readonly (readonly [string, number | undefined])[] = [
      ['0.5', histogram.p50],
      ['0.9', histogram.p90],
      ['0.95', histogram.p95],
      ['0.99', histogram.p99],
    ]
    for (const [quantile, nanoseconds] of points) {
      if (nanoseconds === undefined) continue
      sample(name, labels({ ...extra, quantile }), seconds(nanoseconds))
    }
  }

  const { request, runtime, cache, redis, queue, query, db, health } = input

  metric('dunx_up', 'gauge', '1 if the process is serving.')
  sample('dunx_up', '', 1)

  metric('dunx_runtime_info', 'gauge', 'Runtime build information.')
  sample(
    'dunx_runtime_info',
    labels({
      pid: runtime.pid,
      bun: runtime.bun,
      platform: runtime.platform,
      arch: runtime.arch,
    }),
    1
  )

  metric('dunx_uptime_seconds', 'gauge', 'Process uptime in seconds.')
  sample('dunx_uptime_seconds', '', num(runtime.uptimeMs / 1000))

  metric('dunx_memory_bytes', 'gauge', 'Process memory by kind, in bytes.')
  sample('dunx_memory_bytes', labels({ kind: 'rss' }), runtime.memory.rss)
  sample(
    'dunx_memory_bytes',
    labels({ kind: 'heap_used' }),
    runtime.memory.heapUsed
  )
  sample(
    'dunx_memory_bytes',
    labels({ kind: 'heap_total' }),
    runtime.memory.heapTotal
  )
  sample(
    'dunx_memory_bytes',
    labels({ kind: 'external' }),
    runtime.memory.external
  )

  metric('dunx_cpu_seconds_total', 'counter', 'CPU time in seconds.')
  sample(
    'dunx_cpu_seconds_total',
    labels({ mode: 'user' }),
    num(runtime.cpu.user / 1e6)
  )
  sample(
    'dunx_cpu_seconds_total',
    labels({ mode: 'system' }),
    num(runtime.cpu.system / 1e6)
  )

  metric('dunx_health_ready', 'gauge', '1 when the readiness probe is up.')
  sample(
    'dunx_health_ready',
    '',
    health.status === 'up' && !health.draining ? 1 : 0
  )

  metric('dunx_health_draining', 'gauge', '1 once shutdown draining began.')
  sample('dunx_health_draining', '', health.draining ? 1 : 0)

  metric('dunx_health_check', 'gauge', 'Health check state: 1 up, 0 otherwise.')
  for (const check of health.checks) {
    sample(
      'dunx_health_check',
      labels({ name: check.name, critical: String(check.critical) }),
      check.state === 'up' ? 1 : 0
    )
  }

  metric(
    'dunx_http_requests_total',
    'counter',
    'HTTP requests by route and status.'
  )
  for (const route of request.routes) {
    for (const [status, count] of Object.entries(route.byStatus)) {
      sample(
        'dunx_http_requests_total',
        labels({ route: route.route, method: route.method, status }),
        count
      )
    }
  }

  metric(
    'dunx_http_request_duration_seconds',
    'gauge',
    'HTTP request latency quantiles in seconds.'
  )
  for (const route of request.routes) {
    quantiles('dunx_http_request_duration_seconds', route.duration, {
      route: route.route,
      method: route.method,
    })
  }

  metric('dunx_http_in_flight', 'gauge', 'Requests currently in flight.')
  sample('dunx_http_in_flight', '', request.inFlight)
  metric('dunx_http_pending_websockets', 'gauge', 'Pending websockets.')
  sample('dunx_http_pending_websockets', '', request.pendingWebSockets)

  metric('dunx_db_up', 'gauge', '1 when the metrics query reached PostgreSQL.')
  sample('dunx_db_up', '', db.up ? 1 : 0)
  metric(
    'dunx_db_connections',
    'gauge',
    'PostgreSQL connections for the current database by state.'
  )
  for (const connection of db.connections) {
    sample(
      'dunx_db_connections',
      labels({ state: connection.state }),
      connection.count
    )
  }

  metric('dunx_db_queries_total', 'counter', 'SQL statements by operation.')
  for (const operation of query.operations) {
    sample(
      'dunx_db_queries_total',
      labels({ operation: operation.operation }),
      operation.count
    )
  }
  metric('dunx_db_query_errors_total', 'counter', 'SQL statements that failed.')
  for (const operation of query.operations) {
    sample(
      'dunx_db_query_errors_total',
      labels({ operation: operation.operation }),
      operation.errors
    )
  }
  metric(
    'dunx_db_query_duration_seconds',
    'gauge',
    'SQL statement latency quantiles in seconds.'
  )
  for (const operation of query.operations) {
    quantiles('dunx_db_query_duration_seconds', operation.duration, {
      operation: operation.operation,
    })
  }

  metric('dunx_cache_hits_total', 'counter', 'Cache hits.')
  sample('dunx_cache_hits_total', '', cache.hits)
  metric('dunx_cache_misses_total', 'counter', 'Cache misses.')
  sample('dunx_cache_misses_total', '', cache.misses)
  metric('dunx_cache_errors_total', 'counter', 'Cache errors.')
  sample('dunx_cache_errors_total', '', cache.errors)
  metric('dunx_cache_operations_total', 'counter', 'Cache operations by kind.')
  for (const operation of cache.operations) {
    sample(
      'dunx_cache_operations_total',
      labels({ operation: operation.operation }),
      operation.count
    )
  }
  metric(
    'dunx_cache_operation_duration_seconds',
    'gauge',
    'Cache operation latency quantiles in seconds.'
  )
  for (const operation of cache.operations) {
    quantiles('dunx_cache_operation_duration_seconds', operation.duration, {
      operation: operation.operation,
    })
  }

  metric('dunx_redis_commands_total', 'counter', 'Redis commands by verb.')
  for (const command of redis.commands) {
    sample(
      'dunx_redis_commands_total',
      labels({ command: command.command }),
      command.count
    )
  }
  metric('dunx_redis_errors_total', 'counter', 'Redis command errors.')
  sample('dunx_redis_errors_total', '', redis.errors)
  metric(
    'dunx_redis_command_duration_seconds',
    'gauge',
    'Redis command latency quantiles in seconds.'
  )
  for (const command of redis.commands) {
    quantiles('dunx_redis_command_duration_seconds', command.duration, {
      command: command.command,
    })
  }

  metric(
    'dunx_queue_published_total',
    'counter',
    'Jobs published by queue and name.'
  )
  metric(
    'dunx_queue_publish_errors_total',
    'counter',
    'Job enqueues that failed.'
  )
  metric('dunx_queue_handled_total', 'counter', 'Jobs handled in this process.')
  metric('dunx_queue_failed_total', 'counter', 'Jobs that threw.')
  metric(
    'dunx_queue_timed_out_total',
    'counter',
    'Jobs rejected by the timeout.'
  )
  metric(
    'dunx_queue_pending',
    'gauge',
    'Approximate backlog: published minus failed enqueues and handled jobs.'
  )
  for (const job of queue.jobs) {
    const labelText = labels({ queue: job.queue, name: job.name })
    sample('dunx_queue_published_total', labelText, job.published)
    sample('dunx_queue_publish_errors_total', labelText, job.publishErrors)
    sample('dunx_queue_handled_total', labelText, job.handled)
    sample('dunx_queue_failed_total', labelText, job.failed)
    sample('dunx_queue_timed_out_total', labelText, job.timedOut)
    sample(
      'dunx_queue_pending',
      labelText,
      Math.max(0, job.published - job.publishErrors - job.handled)
    )
  }
  metric(
    'dunx_queue_handler_duration_seconds',
    'gauge',
    'Queue handler latency quantiles in seconds.'
  )
  for (const job of queue.jobs) {
    quantiles('dunx_queue_handler_duration_seconds', job.handlerDuration, {
      queue: job.queue,
      name: job.name,
    })
  }

  return `${lines.join('\n')}\n`
}
