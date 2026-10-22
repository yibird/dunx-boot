import { join } from 'node:path'
import { ConfigService } from '@dunx/core'
import { config as configSchema } from './schemas'
import { CONFIG_DIR, CONFIG_EXTENSION } from './constant'
import { getEnv } from './env'
import type { AppConfig } from './schemas'

export class AppConfigService extends ConfigService<AppConfig> {}

/**
 * 获取配置文件列表
 *
 * @returns 配置文件列表
 */
export function getConfigFiles(): string[] {
  return [
    join(CONFIG_DIR, `application${CONFIG_EXTENSION}`),
    join(CONFIG_DIR, `application-${getEnv()}${CONFIG_EXTENSION}`),
  ]
}

export { configSchema }
export { APP_ENVS, getEnv, isDev, isProd, isTest } from './env'
export * from './constant'
export type * from './schemas'
