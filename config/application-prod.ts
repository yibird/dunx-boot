import type {
  DatabaseConfig,
  RedisConfig,
  SecurityConfig,
  TracingConfig,
} from '@/infra/config'

/**
 * 生产环境覆盖层：只写与基础层不同的项，值一律来自部署环境。
 *
 * `config/application.ts` 不含数据库地址与密钥，所以这一层不能省：
 * `DATABASE_URL` 缺失会让启动在校验 `database.url` 时直接失败，
 * 而不是带着空地址跑起来。
 */
const database: Partial<DatabaseConfig> = {
  url: Bun.env.DATABASE_URL ?? '',
}

const redis: Partial<RedisConfig> = {
  url: Bun.env.REDIS_URL,
}

const tracing: Partial<TracingConfig> = {
  endpoint: Bun.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
}

const security: DeepPartial<SecurityConfig> = {
  auth: {
    secret: Bun.env.AUTH_SECRET ?? '',
  },
  cors: {
    origin: (Bun.env.CORS_ORIGIN ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  csrf: true,
}

export default {
  ai: {
    ...(Bun.env.AI_CREDENTIAL_SECRET
      ? { credentialSecret: Bun.env.AI_CREDENTIAL_SECRET }
      : {}),
  },
  database,
  redis,
  tracing,
  security,
}
