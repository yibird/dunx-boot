export type AppEnv = 'dev' | 'test' | 'prod'

/**
 * `.env` 里允许出现的键；声明在这里，代码里才能用 `Bun.env.X` 点访问
 * （`noPropertyAccessFromIndexSignature` 不允许从索引签名上点取属性）。
 *
 * 这份清单要和配置覆盖层实际读的键保持一致：少了编译不过，多了就是没人读的键。
 */
declare module 'bun' {
  interface Env {
    /**
     * 应用环境
     */
    APP_ENV?: AppEnv
    /**
     * 配置目录，默认为 `config`
     */
    CONFIG_DIR?: string
    /**
     * 数据库连接字符串
     */
    DATABASE_URL?: string
    /**
     * Redis 连接字符串
     */
    REDIS_URL?: string
    /**
     * JWT 密钥
     */
    AUTH_SECRET?: string
    /**
     * 供应商 API Key 的独立加密密钥，至少 32 字符。
     */
    AI_CREDENTIAL_SECRET?: string
    /**
     * 仅供 encrypt-ai-key 脚本读取的待加密 API Key。
     */
    AI_API_KEY?: string
    /**
     * deepseek api key
     */
    DEEPSEEK_API_KEY?: string
    /**
     * 允许跨域的来源，多个用逗号分隔
     */
    CORS_ORIGIN?: string
    /**
     * 对外可访问的站点地址
     */
    PUBLIC_URL?: string
    /**
     * OTLP 链路追踪上报地址
     */
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?: string
  }
}
