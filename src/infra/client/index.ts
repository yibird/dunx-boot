import { HttpModule as HttpClientModule } from '@dunx/http/client'
import { AppConfigService } from '../config'

/**
 * 默认出站 HTTP 客户端：全局发布 `HttpService` / `HttpClientOptions`，
 * 带基础地址、超时与重试。
 *
 * `client.maxRetries` 默认 0：框架的重试分类器只看错误是不是 abort，
 * 不看请求方法，开着它就等于允许把一次 POST 变成两次。
 */
export const AppHttpClientModule = HttpClientModule.forRootAsync({
  useFactory: (config: AppConfigService) => {
    const { baseUrl, timeoutMs, maxRetries, retryDelayMs } =
      config.values.client
    return {
      baseUrl,
      timeoutMs,
      retry: { maxRetries, retryDelayMs },
    }
  },
  inject: [AppConfigService] as const,
})
