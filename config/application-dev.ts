import type {
  ClientConfig,
  DashboardConfig,
  DatabaseConfig,
  LogConfig,
  OpenapiConfig,
  RedisConfig,
  SecurityConfig,
  TracingConfig,
} from '@/infra/config'

/**
 * 开发环境覆盖层：只写与基础层不同的项。
 *
 * 密钥和跟机器绑定的地址在这里读 `.env`（键都在 `types/env.d.ts` 里声明过）
 * 并给出本地回退，其余一律写成字面量。
 */
/**
 * 文档标签分组：operation 只带叶子标签（`@ApiDoc({ tags: ['用户'] })`），
 * 父子关系只在这里声明一次。3.1 输出为 `x-tagGroups`，Scalar/Redoc 会隐藏
 * 未归入任何分组的标签，所以这里的 tags 必须覆盖全部叶子标签。
 *
 * 放在开发覆盖层：文档模块只在非生产环境挂载（见 `src/index.ts`），
 * 生产层读不到这些值，写进基础层就是死旋钮。
 */
const openapi: Partial<OpenapiConfig> = {
  title: 'dunx-boot',
  version: '0.1.0',
  path: '/docs',
  description: '一个基于Dunx的启动器',
  servers: [{ url: Bun.env.PUBLIC_URL ?? 'http://localhost:3000' }],
  tagGroups: [
    {
      name: '系统',
      tags: [
        '用户',
        '角色',
        '部门',
        '岗位',
        '菜单',
        '租户',
        '字典类型',
        '认证',
        '通知公告',
        '系统消息',
        '操作日志',
        '登录日志',
        '验证码日志',
        '请求日志',
        '指标',
        '文件',
      ],
    },
    {
      name: 'AI',
      tags: ['Model', 'Model Privoder', 'Prompt', 'Agent', 'Chat', 'Skill'],
    },
    {
      name: '项目管理',
      tags: [
        '项目',
        '项目成员',
        '任务',
        '任务标签',
        '任务评论',
        '任务附件',
        '任务动态',
      ],
    },
  ],
}

const database: Partial<DatabaseConfig> = {
  url:
    Bun.env.DATABASE_URL ??
    'postgresql://postgres:123456@127.0.0.1:5432/dunx-boot?search_path=public',
}

const redis: Partial<RedisConfig> = {
  url: Bun.env.REDIS_URL ?? 'redis://localhost:6379',
}

const tracing: Partial<TracingConfig> = {
  endpoint: Bun.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
}

/**
 * 本地联调要看请求与响应体；生产层没有覆盖它，所以那边保持关闭
 */
const log: Partial<LogConfig> = {
  requestBody: true,
  responseBody: true,
}

/**
 * 仅开发用的固定密钥：长度满足 HS256 要求，且一眼能看出不该拿去部署
 */
const security: DeepPartial<SecurityConfig> = {
  auth: {
    secret: 'dev-only-insecure-jwt-secret-do-not-deploy',
  },
  cors: {
    origin: 'http://localhost:3000',
  },
}

/**
 * 本地上游就在本机，超时收短，问题暴露得更早
 */
const client: Partial<ClientConfig> = {
  timeoutMs: 5000,
}

const dashboard: Partial<DashboardConfig> = {
  enabled: true,
}

export default {
  ai: {
    ...(Bun.env.AI_CREDENTIAL_SECRET
      ? { credentialSecret: Bun.env.AI_CREDENTIAL_SECRET }
      : {}),
  },
  openapi,
  database,
  redis,
  tracing,
  log,
  security,
  client,
  dashboard,
}
