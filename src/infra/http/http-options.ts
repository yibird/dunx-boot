import {
  HttpOptionsProvider,
  type CorsOptions,
  type CsrfOptions,
  type ErrorHandler,
  type RequestLoggingOptions,
  type SecurityHeadersOptions,
} from '@dunx/http'
import { AppConfigService } from '../config'
import { AppErrorFilter } from './error-filter'

/**
 * http 选项配置
 */
export class AppHttpOptions extends HttpOptionsProvider {
  constructor(private readonly config: AppConfigService) {
    super()
    this.trustProxy = this.config.values.server.trustProxy
  }

  /**
   * 是否信任代理，如 Nginx、Cloudflare 等。
   */
  override readonly trustProxy: boolean

  /**
   * 全局路由前缀来自 `server.basePath`，与 URL 里的 `/api/...` 一致
   */
  override get prefix(): string {
    return this.config.values.server.basePath
  }

  /**
   * 请求空闲超时来自 `server.idleTimeout`；不配置则交给 Bun 自己的默认值
   */
  override get idleTimeout(): number | undefined {
    return this.config.values.server.idleTimeout
  }

  override get cors(): CorsOptions | undefined {
    const cors = this.config.values.security.cors
    if (!cors.origin) return undefined
    return cors as CorsOptions
  }

  override get securityHeaders(): boolean | SecurityHeadersOptions {
    return this.config.values.security.securityHeaders
  }

  override get csrf(): boolean | CsrfOptions {
    return this.config.values.security.csrf ?? false
  }

  override get requestLogging(): RequestLoggingOptions {
    const log = this.config.values.log
    const prefix = this.prefix.replace(/^\/+|\/+$/g, '')
    const filesPath = `${prefix ? `/${prefix}` : ''}/files`
    return {
      requestBody: log.requestBody,
      responseBody: log.responseBody,
      ignore: [filesPath, `${filesPath}/upload/chunk`, `${filesPath}/download`],
      correlateIgnored: true,
      // 对话、Agent 提示词和私有技能正文不复制到通用请求日志。
      ignorePrefix: [
        this.config.values.dashboard.path,
        `${prefix ? `/${prefix}` : ''}/ai/chat`,
        `${prefix ? `/${prefix}` : ''}/ai/agent`,
        `${prefix ? `/${prefix}` : ''}/ai/skill`,
      ],
    }
  }

  /**
   * 错误响应使用统一的 `Api` 外壳（`{ code, message, data }`）。
   */
  override get onError(): ErrorHandler {
    return AppErrorFilter
  }
}
