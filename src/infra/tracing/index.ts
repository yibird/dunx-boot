import { Module, provide, Tracer } from '@dunx/core'
import { AppConfigService } from '../config'
import { AppTracing } from './service'

/**
 * 与 OtelModule 相同的 Tracer 绑定，加上配置和 SDK 生命周期依赖。
 */
@Module({
  global: true,
  providers: [
    provide(AppTracing, {
      useFactory: (config: AppConfigService) => AppTracing.create(config),
      inject: [AppConfigService] as const,
    }),
    provide(Tracer, {
      useFactory: (tracing: AppTracing) => tracing.tracer,
      inject: [AppTracing] as const,
    }),
  ],
  exports: [Tracer, AppTracing],
})
export class AppTracingModule {}

export { AppTracing }
