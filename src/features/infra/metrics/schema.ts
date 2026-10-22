import { z } from 'zod'

// 请求指标
export const SysRequestMetricsSchema = z
  .object({
    // 路由指标
    routes: z.array(
      z.object({
        route: z.string().meta({ description: '路由' }),
        method: z
          .enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
          .meta({ description: '请求方法' }),
        count: z.number().int().nonnegative().meta({ description: '查询次数' }),
        byStatus: z
          .record(z.string(), z.number().int().nonnegative())
          .meta({ description: '状态码分布' }),
        duration: z.object({
          count: z
            .number()
            .int()
            .nonnegative()
            .meta({ description: '查询次数' }),
          min: z.number().nonnegative().meta({ description: '最小耗时' }),
          max: z.number().nonnegative().meta({ description: '最大耗时' }),
          p50: z.number().nonnegative().meta({ description: '50%耗时' }),
          p90: z.number().nonnegative().meta({ description: '90%耗时' }),
          p95: z.number().nonnegative().meta({ description: '95%耗时' }),
          p99: z.number().nonnegative().meta({ description: '99%耗时' }),
          p999: z.number().nonnegative().meta({ description: '999%耗时' }),
        }),
        slowestTraceId: z
          .string()
          .nullable()
          .optional()
          .meta({ description: '慢请求跟踪ID' }), // 没有慢请求时可能为 null
      })
    ),
    // 当前进行中的请求数
    inFlight: z
      .number()
      .int()
      .nonnegative()
      .meta({ description: '当前进行中的请求数' }),
    // 待处理的 Web 套接字数
    pendingWebSockets: z
      .number()
      .int()
      .nonnegative()
      .meta({ description: '待处理的 Web 套接字数' }),
    // 从开始收集指标的时间
    since: z.iso.datetime().meta({ description: '从开始收集指标的时间' }),
  })
  .meta({ description: '请求指标' })

// 数据库查询指标
export const SysQueryMetricsSchema = z
  .object({
    // 数据库操作
    operations: z.array(
      z
        .object({
          operation: z
            .enum(['select', 'insert', 'update', 'delete'])
            .meta({ description: '数据库操作' }),
          count: z
            .number()
            .int()
            .nonnegative()
            .meta({ description: '查询次数' }),
          errors: z
            .number()
            .int()
            .nonnegative()
            .meta({ description: '错误次数' }),
          // 单个操作的耗时统计
          duration: z
            .object({
              count: z
                .number()
                .int()
                .nonnegative()
                .meta({ description: '查询次数' }),
              min: z.number().nonnegative().meta({ description: '最小耗时' }),
              max: z.number().nonnegative().meta({ description: '最大耗时' }),
              p50: z.number().nonnegative().meta({ description: '50%耗时' }),
              p90: z.number().nonnegative().meta({ description: '90%耗时' }),
              p95: z.number().nonnegative().meta({ description: '95%耗时' }),
              p99: z.number().nonnegative().meta({ description: '99%耗时' }),
              p999: z.number().nonnegative().meta({ description: '999%耗时' }),
            })
            .meta({ description: '耗时指标' }),
          slowest: z
            .string()
            .nullable()
            .optional()
            .meta({ description: '慢请求SQL' }),
        })
        .meta({ description: '数据库操作指标' })
    ),
    total: z.number().int().nonnegative().meta({ description: '总查询次数' }),
    since: z.iso.datetime().meta({ description: '从开始收集指标的时间' }),
  })
  .meta({ description: '数据库查询指标' })

// 缓存指标
export const SysCacheMetricsSchema = z
  .object({
    operations: z.array(
      z.object({
        operation: z.string().meta({ description: '缓存操作' }),
        count: z.number().int().nonnegative().meta({ description: '查询次数' }),
        errors: z
          .number()
          .int()
          .nonnegative()
          .meta({ description: '错误次数' }),
        duration: z.object({
          count: z
            .number()
            .int()
            .nonnegative()
            .meta({ description: '查询次数' }),
          min: z
            .number()
            .nonnegative()
            .optional()
            .meta({ description: '最小耗时' }),
          max: z
            .number()
            .nonnegative()
            .optional()
            .meta({ description: '最大耗时' }),
          p50: z
            .number()
            .nonnegative()
            .optional()
            .meta({ description: '50%耗时' }),
          p90: z
            .number()
            .nonnegative()
            .optional()
            .meta({ description: '90%耗时' }),
          p95: z
            .number()
            .nonnegative()
            .optional()
            .meta({ description: '95%耗时' }),
          p99: z
            .number()
            .nonnegative()
            .optional()
            .meta({ description: '99%耗时' }),
          p999: z
            .number()
            .nonnegative()
            .optional()
            .meta({ description: '999%耗时' }),
        }),
      })
    ),
    hits: z.number().int().nonnegative().meta({ description: '命中次数' }),
    misses: z.number().int().nonnegative().meta({ description: '未命中次数' }),
    hitRate: z.number().min(0).max(1).meta({ description: '命中率' }),
    total: z.number().int().nonnegative().meta({ description: '总查询次数' }),
    errors: z.number().int().nonnegative().meta({ description: '错误次数' }),
    since: z.iso.datetime().meta({ description: '从开始收集指标的时间' }),
  })
  .meta({ description: '缓存指标' })

// Redis 命令指标
export const SysRedisMetricsSchema = z
  .object({
    commands: z.array(
      z.object({
        command: z.string().meta({ description: 'Redis 命令' }),
        count: z
          .number()
          .int()
          .nonnegative()
          .meta({ description: '命令执行次数' }),
        errors: z
          .number()
          .int()
          .nonnegative()
          .meta({ description: '错误次数' }),
        duration: z.object({
          count: z
            .number()
            .int()
            .nonnegative()
            .meta({ description: '命令执行次数' }),
          min: z.number().nonnegative().meta({ description: '最小耗时' }),
          max: z.number().nonnegative().meta({ description: '最大耗时' }),
          p50: z.number().nonnegative().meta({ description: '50%耗时' }),
          p90: z.number().nonnegative().meta({ description: '90%耗时' }),
          p95: z.number().nonnegative().meta({ description: '95%耗时' }),
          p99: z.number().nonnegative().meta({ description: '99%耗时' }),
          p999: z.number().nonnegative().meta({ description: '999%耗时' }),
        }),
      })
    ),
    total: z.number().int().nonnegative().meta({ description: '总查询次数' }),
    errors: z.number().int().nonnegative().meta({ description: '错误次数' }),
    since: z.iso.datetime().meta({ description: '从开始收集指标的时间' }),
  })
  .meta({ description: 'Redis 指标' })

const QueueDurationSchema = z.object({
  count: z.number().int().nonnegative().meta({ description: '任务处理次数' }),
  min: z.number().nonnegative().meta({ description: '最小耗时' }),
  max: z.number().nonnegative().meta({ description: '最大耗时' }),
  p50: z.number().nonnegative().meta({ description: '50%耗时' }),
  p90: z.number().nonnegative().meta({ description: '90%耗时' }),
  p95: z.number().nonnegative().meta({ description: '95%耗时' }),
  p99: z.number().nonnegative().meta({ description: '99%耗时' }),
  p999: z.number().nonnegative().meta({ description: '999%耗时' }),
})

export const SysQueueMetricsSchema = z
  .object({
    // 队列任务
    jobs: z.array(
      z.object({
        queue: z.string().meta({ description: '队列名称' }),
        name: z.string().meta({ description: '任务名称' }),
        published: z
          .number()
          .int()
          .nonnegative()
          .meta({ description: '已发布任务数' }),
        publishErrors: z
          .number()
          .int()
          .nonnegative()
          .meta({ description: '发布任务错误数' }),
        publishDuration: QueueDurationSchema,
        handled: z
          .number()
          .int()
          .nonnegative()
          .meta({ description: '已处理任务数' }),
        failed: z
          .number()
          .int()
          .nonnegative()
          .meta({ description: '处理任务失败数' }),
        timedOut: z
          .number()
          .int()
          .nonnegative()
          .meta({ description: '处理任务超时数' }),
        handlerDuration: QueueDurationSchema,
      })
    ),
    published: z
      .number()
      .int()
      .nonnegative()
      .meta({ description: '已发布任务数' }),
    handled: z
      .number()
      .int()
      .nonnegative()
      .meta({ description: '已处理任务数' }),
    since: z.iso.datetime().meta({ description: '从开始收集指标的时间' }),
  })
  .meta({ description: '队列指标' })

// 运行时指标
export const SysRuntimeMetricsSchema = z
  .object({
    pid: z.number().int().positive().meta({ description: '进程ID' }),
    uptimeMs: z
      .number()
      .nonnegative()
      .meta({ description: '进程运行时间（毫秒）' }),
    now: z.iso.datetime().meta({ description: '当前时间' }),
    bun: z.string().meta({ description: 'Bun 版本' }),
    platform: z.string().meta({ description: '平台' }),
    arch: z.string().meta({ description: '架构' }),
    memory: z.object({
      rss: z.number().int().nonnegative().meta({ description: 'RSS' }),
      heapUsed: z.number().int().nonnegative().meta({ description: '堆使用' }),
      heapTotal: z.number().int().nonnegative().meta({ description: '堆总' }),
      external: z.number().int().nonnegative().meta({ description: '外部' }),
    }),
    cpu: z.object({
      user: z.number().nonnegative().meta({ description: '用户CPU时间' }),
      system: z.number().nonnegative().meta({ description: '系统CPU时间' }),
    }),
    resource: z.object({
      maxRSS: z.number().int().nonnegative().meta({ description: '最大RSS' }),
      minorPageFault: z
        .number()
        .int()
        .nonnegative()
        .meta({ description: '次页错误' }),
      majorPageFault: z
        .number()
        .int()
        .nonnegative()
        .meta({ description: '主页错误' }),
      voluntaryContextSwitches: z
        .number()
        .int()
        .nonnegative()
        .meta({ description: '自愿上下文切换' }),
      involuntaryContextSwitches: z
        .number()
        .int()
        .nonnegative()
        .meta({ description: '非自愿上下文切换' }),
    }),
  })
  .meta({ description: '运行时指标' })

// 系统指标
export const SysMetricsSchema = z
  .object({
    // 请求指标
    request: SysRequestMetricsSchema,
    // 查询指标
    query: SysQueryMetricsSchema,
    // 缓存指标
    cache: SysCacheMetricsSchema,
    // Redis 命令指标
    redis: SysRedisMetricsSchema,
    // 队列指标
    queue: SysQueueMetricsSchema,
    // 运行时指标
    runtime: SysRuntimeMetricsSchema,
  })
  .meta({ id: 'SysMetrics' })

export type SysRequestMetrics = z.infer<typeof SysRequestMetricsSchema>
export type SysQueryMetrics = z.infer<typeof SysQueryMetricsSchema>
export type SysCacheMetrics = z.infer<typeof SysCacheMetricsSchema>
export type SysRedisMetrics = z.infer<typeof SysRedisMetricsSchema>
export type SysQueueMetrics = z.infer<typeof SysQueueMetricsSchema>
export type SysRuntimeMetrics = z.infer<typeof SysRuntimeMetricsSchema>
export type SysMetrics = z.infer<typeof SysMetricsSchema>
