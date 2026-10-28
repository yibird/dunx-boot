import { z } from 'zod'

/**
 * 扫码登录：每张二维码短期有效，整个等待会话有总时限与容量上限。
 */
const qrLogin = z
  .object({
    rotationMs: z.number().int().min(1000).max(300_000).default(30_000),
    sessionTtlMs: z.number().int().min(1000).max(1_800_000).default(300_000),
    maxSessions: z.number().int().min(1).max(10_000).default(1000),
  })
  .refine((value) => value.sessionTtlMs >= value.rotationMs, {
    message: '扫码登录会话有效期不能短于二维码刷新间隔',
  })

/**
 * 认证配置（JWT 双令牌 + 免认证白名单）。
 *
 * 它是 `security` 下的一块，不是顶层节：读 `security.auth.secret`。
 */
export const auth = z.object({
  /**
   * JWT 密钥（HS256）；至少 32 个字符，各环境的配置文件负责提供
   */
  secret: z.string().min(32, 'security.auth.secret 至少需要 32 个字符'),
  /**
   * JWT 算法(HS256)
   */
  alg: z.string().default('HS256'),
  /**
   * JWT 类型（JWT）
   */
  typ: z.string().default('JWT'),
  /**
   * 访问令牌有效期（秒），默认 30 分钟
   */
  accessTtl: z.coerce.number().int().positive().default(1800),
  /**
   * 刷新令牌有效期（秒），默认 7 天
   */
  refreshTtl: z.coerce.number().int().positive().default(604800),
  /**
   * 扫码登录配置（时间单位：毫秒）
   */
  qrLogin: qrLogin.prefault({}),
  /**
   * 签发者（iss）
   */
  issuer: z.string().default('dunx-boot'),
  /**
   * 免认证普通路径：匹配自身及子路径；`/api/docs` 不会匹配 `/api/docsx`。
   * 不支持通配符、查询串或片段；根路径 `/` 放行所有路径。
   * 中间件构造时校验并创建 Set；登录等公开端点通过 `@Public()` 放行。
   */
  whiteList: z.array(z.string()).default(['/api/docs', '/api/openapi.json']),
})

/**
 * 跨域来源：单个来源、来源数组，或 `(origin) => boolean`
 */
export const corsOrigin = z.union([
  z.string(),
  z.array(z.string()).readonly(),
  z.function({
    input: [z.string()],
    output: z.boolean(),
  }),
])

/**
 * 跨域配置。
 *
 * 整块缺省即不挂 CORS：`AppHttpOptions` 只在 `origin` 真的配了时才交给框架
 * ——只写 `credentials` 之类的配置会让框架按 `origin ?? '*'` 回显任意来源，
 * 等于静默放开跨域。
 */
export const cors = z.object({
  /**
   * 允许的来源：单个来源、来源数组，或自己判断的 `(origin) => boolean`
   */
  origin: corsOrigin.optional(),
  /**
   * 允许的方法
   */
  methods: z.array(z.string()).readonly().optional(),
  /**
   * 允许的请求头
   */
  allowedHeaders: z.array(z.string()).readonly().optional(),
  /**
   * 暴露给浏览器的响应头
   */
  exposedHeaders: z.array(z.string()).readonly().optional(),
  /**
   * 是否允许携带凭证
   */
  credentials: z.boolean().optional(),
  /**
   * 预检结果缓存秒数
   */
  maxAge: z.number().optional(),
})

/**
 * csrf配置
 */
export const csrf = z
  .union([
    z.boolean(),
    z.object({
      trustedOrigins: z.array(z.string()),
    }),
  ])
  .optional()

/**
 * 安全配置
 */
export const security = z.object({
  auth,
  cors,
  securityHeaders: z.coerce.boolean().default(true),
  csrf,
})
