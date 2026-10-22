import { Logger, provide } from '@dunx/core'
import { HttpFactory, RedisRelay, type HttpApp } from '@dunx/http'
import { AppModule } from './infra'
import { AppConfigService, isProd } from './infra/config'
import { createOpenApiModule } from './infra/openapi'
import { globalMiddleware } from './middleware'
import { AppTracing } from './infra/tracing'

export const createApp = async (): Promise<HttpApp> => {
  const RootModule = isProd() ? AppModule : createOpenApiModule(AppModule)
  let tracing: AppTracing | undefined
  try {
    return await HttpFactory.create(RootModule, {
      metrics: true,
      websocket: { idleTimeout: 30 },
      relay: new RedisRelay({ connectionTimeout: 500 }),
      middleware: [...globalMiddleware],
      overrides: [
        provide(AppTracing, {
          useFactory: async (config: AppConfigService) => {
            tracing = await AppTracing.create(config)
            return tracing
          },
          inject: [AppConfigService] as const,
        }),
      ],
    })
  } catch (error) {
    // 框架创建中途失败时不会执行 provider 的 onShutdown。
    await tracing?.onShutdown().catch(() => {})
    throw error
  }
}

const start = async () => {
  const startedAt = performance.now()
  const app = await createApp()
  app.enableShutdownHooks()

  const config = app.get(AppConfigService)
  const logger = app.get(Logger)
  const basePath = config.values.server.basePath
  const url = await app.listen(config.values.server.port)
  const path = (suffix: string) => `${basePath ? `/${basePath}` : ''}${suffix}`

  logger.info(
    `listening on ${url},startup:  ${Math.round(performance.now() - startedAt)}ms`
  )
  if (!isProd()) {
    logger.info(
      `docs    ${new URL(path(config.values.openapi.path), url).href}`
    )
    logger.info(
      `openapi ${new URL(path(config.values.openapi.jsonPath), url).href}`
    )
  }
  logger.info(`health  ${new URL(path('/health/live'), url).href}`)
  logger.info(`ready   ${new URL(path('/health/ready'), url).href}`)

  await app.closed
}

const isEntrypoint =
  import.meta.main || normalize(Bun.main) === normalize(import.meta.path)

function normalize(path: string) {
  return path.replaceAll('\\', '/')
}

if (isEntrypoint) {
  start().catch((error: unknown) => {
    console.error('failed to start', error)
    process.exit(1)
  })
}
