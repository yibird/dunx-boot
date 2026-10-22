import { NoopTracer, type OnShutdown, type Tracer } from '@dunx/core'
import { OtelTracer } from '@dunx/core/otel'
import { context, propagation, trace } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
  BatchSpanProcessor,
  NodeTracerProvider,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-node'
import { getEnv, type AppConfigService } from '../config'

interface TracingRuntime {
  provider: NodeTracerProvider
  key: string
  users: number
  closing?: Promise<void>
}

// OTel API 是进程级单例；同一进程的多个 app 共享 SDK，最后一个关闭时收尾。
let runtime: TracingRuntime | undefined

/**
 * 管理 SDK 及其全局注册；先注册 SDK，再构造框架的 OtelTracer。
 */
export class AppTracing implements OnShutdown {
  #shutdown: Promise<void> | undefined

  constructor(
    readonly tracer: Tracer,
    private readonly shared?: TracingRuntime
  ) {}

  static async create(config: AppConfigService): Promise<AppTracing> {
    const { application, tracing } = config.values
    if (!tracing.enabled || !tracing.endpoint) {
      return new AppTracing(new NoopTracer())
    }

    if (runtime?.closing) {
      await runtime.closing
      return AppTracing.create(config)
    }
    const env = getEnv()
    const key = JSON.stringify({ application, tracing, env })
    if (runtime && runtime.key !== key) {
      throw new Error('同一进程中的应用必须使用相同的 tracing 配置')
    }

    if (!runtime) {
      const provider = new NodeTracerProvider({
        resource: resourceFromAttributes({
          'service.name': application.name,
          'service.version': application.version,
          'deployment.environment.name': env,
        }),
        sampler: new ParentBasedSampler({
          root: new TraceIdRatioBasedSampler(tracing.sampleRatio),
        }),
        spanProcessors: [
          new BatchSpanProcessor(
            new OTLPTraceExporter({
              url: tracing.endpoint,
              timeoutMillis: tracing.exportTimeoutMs,
            }),
            { exportTimeoutMillis: tracing.exportTimeoutMs }
          ),
        ],
      })
      provider.register()
      runtime = { provider, key, users: 0 }
    }

    runtime.users++
    return new AppTracing(new OtelTracer(), runtime)
  }

  onShutdown(): Promise<void> {
    return (this.#shutdown ??= this.#release())
  }

  async #release(): Promise<void> {
    const shared = this.shared
    if (!shared || --shared.users > 0) return

    shared.closing = (async () => {
      try {
        // BatchSpanProcessor.shutdown 会先导出队列中尚未发送的 span。
        await shared.provider.shutdown()
      } finally {
        trace.disable()
        context.disable()
        propagation.disable()
        runtime = undefined
      }
    })()
    await shared.closing
  }
}
