import type {
  ApplicationConfig,
  CacheConfig,
  ClientConfig,
  DashboardConfig,
  EmailConfig,
  FilesConfig,
  HealthConfig,
  ImagesConfig,
  LogConfig,
  QueueConfig,
  RedisConfig,
  RequestLogConfig,
  ResilienceConfig,
  ScheduleConfig,
  SecurityConfig,
  SeedConfig,
  ServerConfig,
  TracingConfig,
} from '@/infra/config'

/**
 * 应用配置
 */
const application: ApplicationConfig = {
  name: 'dunx-boot',
  version: '0.1.0',
}

/**
 * 日志配置
 */
const log: Partial<LogConfig> = {
  level: 'info',
  requestBody: false,
  responseBody: false,
}

/**
 * 链路追踪配置
 */
const tracing: Partial<TracingConfig> = {
  enabled: true,
  sampleRatio: 1,
  exportTimeoutMs: 2000,
}

/**
 * 请求日志配置
 */
const requestLog: Partial<RequestLogConfig> = {
  retentionDays: 30,
  sampleRate: 1,
  slowMs: 1000,
}

/**
 * 服务配置
 */
const server: Partial<ServerConfig> = {
  port: 3000,
  idleTimeout: 30,
  basePath: 'api',
  trustProxy: false,
}

/**
 * 缓存配置
 */
const cache: Partial<CacheConfig> = {
  local: {
    enabled: true,
    max: 1000,
  },
  remote: {
    enabled: true,
    max: 1000,
  },
  ttl: 60,
}

/**
 * 安全配置
 */
const security: DeepPartial<SecurityConfig> = {
  auth: {
    accessTtl: 1800,
    refreshTtl: 604800,
    qrLogin: {
      rotationMs: 30_000,
      sessionTtlMs: 300_000,
      maxSessions: 1000,
    },
    /*
     * 白名单列表
     */
    whiteList: [
      '/api/docs',
      '/api/openapi.json',
      '/api/auth/**',
      '/api/metrics/openmetrics',
    ],
  },
  csrf: false,
}

/**
 * redis配置
 */
const redis: Partial<RedisConfig> = {
  connectionTimeout: 2000,
  maxRetries: 1,
  enableOfflineQueue: false,
  eager: false,
}

/**
 * 调度配置
 */
const schedule: Partial<ScheduleConfig> = {
  enabled: true,
  tz: 'UTC',
  keepAlive: true,
}

/**
 * 健康检查配置
 */
const health: Partial<HealthConfig> = {
  timeoutMs: 2000,
  drainDelayMs: 0,
}

/**
 * 弹性保护配置
 */
const resilience: DeepPartial<ResilienceConfig> = {
  timeoutMs: 5000,
  maxRetries: 2,
  retryDelayMs: 200,
  throttle: {
    limit: 1000,
    windowSeconds: 60,
    headers: true,
  },
}

/**
 * 客户端配置
 */
const client: Partial<ClientConfig> = {
  timeoutMs: 30_000,
  maxRetries: 0,
  retryDelayMs: 200,
}

/**
 * 队列配置
 */
const queue: Partial<QueueConfig> = {
  prefix: 'bull',
  consume: false,
}

const files: Partial<FilesConfig> = {
  root: 'storage/uploads',
  chunkSize: 5 * 1024 * 1024,
  maxFileSize: 5 * 1024 * 1024 * 1024,
  uploadTtlSeconds: 24 * 60 * 60,
}

/**
 * 图片上限是防解压炸弹的那道闸：框架默认允许 ~268MP（一次解码约 1GB RGBA），
 * 这里收到 25MP / 6000×6000。
 */
const images: Partial<ImagesConfig> = {
  quality: 82,
  maxPixels: 25_000_000,
  maxWidth: 6000,
  maxHeight: 6000,
}

const email: Partial<EmailConfig> = {
  dryRun: true,
  maxPerSecond: 0,
}

const dashboard: Partial<DashboardConfig> = {
  enabled: false,
  path: '/_dunx',
}

const seed: Partial<SeedConfig> = {
  dir: 'src/seeds',
}

export default {
  application,
  log,
  tracing,
  requestLog,
  server,
  cache,
  security,
  redis,
  schedule,
  health,
  resilience,
  client,
  queue,
  files,
  images,
  email,
  dashboard,
  seed,
}
