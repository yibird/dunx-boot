import { Logger } from '@dunx/core'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { DbModule } from './module'
import { AppConfigService } from '../config'
import { relations } from '@/schemas'
import { createCache } from './cache'
export * from './utils'

export const AppDbModule = DbModule.forRootAsync(BunSQLDatabase, {
  useFactory: (config: AppConfigService) => {
    const { cache, ...database } = config.values.database
    return { ...database, drizzle: { relations, cache } }
  },
  cacheFactory: (config: AppConfigService, logger: Logger) =>
    createCache(config, logger),
  inject: [AppConfigService, Logger] as const,
})
