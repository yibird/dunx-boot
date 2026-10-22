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
  ResilienceConfig,
  ScheduleConfig,
  SecurityConfig,
  SeedConfig,
  ServerConfig,
  TracingConfig,
} from '@/infra/config'

/**
 * 基础层：只写默认值，不读环境变量。
 *
 * 会随机器或部署变化的值（数据库、Redis、密钥、对外地址）由
 * `config/application-<env>.ts` 提供，那里也只在必要时读 `.env`。
 * 这里写下的每个键都必须真的被某个模块读走，否则就是死旋钮。
 */
const application: ApplicationConfig = {
  name: 'dunx-boot',
  version: '0.1.0',
}

/**
 * 请求/响应体默认不记：日志一旦开了 body，就等于把业务数据写进了日志系统。
 * 需要联调的环境在自己的覆盖层里打开。
 */
const log: Partial<LogConfig> = {
  level: 'info',
  requestBody: false,
  responseBody: false,
}

/**
 * 采集地址由环境覆盖层提供；未配置地址时保持 NoopTracer。
 */
const tracing: Partial<TracingConfig> = {
  enabled: true,
  sampleRatio: 1,
  exportTimeoutMs: 2000,
}

const server: Partial<ServerConfig> = {
  port: 3000,
  idleTimeout: 30,
  basePath: 'api',
  trustProxy: false,
}

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

// 默认不开放跨域（`security.cors` 整块不写），需要的环境自己声明 `origin`
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
    whiteList: ['/api/docs', '/api/openapi.json', '/api/auth/**'],
  },
}

const redis: Partial<RedisConfig> = {
  connectionTimeout: 2000,
  maxRetries: 1,
  enableOfflineQueue: false,
  eager: false,
}

const schedule: Partial<ScheduleConfig> = {
  enabled: true,
  tz: 'UTC',
  keepAlive: true,
}

const health: Partial<HealthConfig> = {
  timeoutMs: 2000,
  drainDelayMs: 0,
}

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
 * 出站客户端默认不重试：重试非幂等请求（POST）可能把一次写变成两次，
 * 需要重试的调用方在单次请求上显式打开。
 */
const client: Partial<ClientConfig> = {
  timeoutMs: 30_000,
  maxRetries: 0,
  retryDelayMs: 200,
}

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
