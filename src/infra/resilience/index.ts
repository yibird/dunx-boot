import { ResilienceModule } from '@dunx/core'
import { AppConfigService } from '../config'

/**
 * 默认容错策略(超时 + 重试):全局发布 `ResiliencePolicy` / `ResilienceOptions`，
 * 出站调用可注入它包裹一次操作。
 */
export const AppResilienceModule = ResilienceModule.forRootAsync({
  useFactory: (config: AppConfigService) => {
    const { timeoutMs, maxRetries, retryDelayMs } = config.values.resilience
    return { timeoutMs, retry: { maxRetries, retryDelayMs } }
  },
  inject: [AppConfigService] as const,
})
