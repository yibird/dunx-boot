import type { AppEnv } from '#types/env'

/**
 * 支持的应用环境
 */
export const APP_ENVS = ['dev', 'test', 'prod'] as const

/**
 * 读取并校验应用环境。
 *
 * 环境名会拼进配置文件名（`application-<env>.ts`），所以拼错时必须在这里
 * 就报错，而不是让框架跳过那一层、最后以「database.url 为空」收场。
 */
export function getEnv(): AppEnv {
  const value = Bun.env.APP_ENV ?? 'dev'
  if (!(APP_ENVS as readonly string[]).includes(value)) {
    throw new Error(
      `未知的 APP_ENV: "${value}"，可选值：${APP_ENVS.join(' | ')}`
    )
  }
  return value as AppEnv
}

/**
 * 是否为开发环境
 */
export function isDev() {
  return getEnv() === 'dev'
}

/**
 * 是否为生产环境
 */
export function isProd() {
  return getEnv() === 'prod'
}

/**
 * 是否为测试环境
 */
export function isTest() {
  return getEnv() === 'test'
}
