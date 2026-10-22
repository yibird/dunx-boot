import { EmailModule } from '@dunx/infra/email'
import { AppConfigService } from '../config'

/**
 * 邮件基础设施：全局发布 `EmailOptions` / `EmailTransport` / `EmailService`。
 *
 * 未配置 `transport` 时使用日志传输，`email.dryRun` 可强制走日志；
 * 接入 SMTP/Resend 时在 `useFactory` 里换成对应 transport 即可。
 *
 * `resilience.timeoutMs` 必须传：框架默认 0 表示单次发送无上限，
 * 一个卡住的 SMTP 连接会一直挂着。
 */
export const AppEmailModule = EmailModule.forRootAsync({
  useFactory: (config: AppConfigService) => {
    const { from, dryRun, maxPerSecond } = config.values.email
    return {
      from: from ?? 'default@example.com',
      dryRun,
      maxPerSecond,
      resilience: { timeoutMs: config.values.resilience.timeoutMs },
    }
  },
  inject: [AppConfigService] as const,
})
