import { Logger } from '@dunx/core'
import { unstorageCache, type UnstorageCache } from 'drizzle-uncache'
import { createStorage, type Storage } from 'unstorage'
import memoryDriver from 'unstorage/drivers/memory'
import type { AppConfigService } from '../config'

/**
 * 构建 drizzle 查询缓存（drizzle-uncache + unstorage）。
 *
 * 仅使用本地内存，由 cache.local.enabled 控制，不依赖 Redis。
 *
 * 默认 `strategy` 是显式的：只有调用 `.$withCache()` 的查询才缓存；
 * insert/update/delete 由 drizzle 自动按表失效。
 */
export function createCache(
  config: AppConfigService,
  logger: Logger
): UnstorageCache | undefined {
  const { local, ttl, prefix } = config.values.cache
  if (!local.enabled) return undefined
  const cacheTtl = local.ttl ?? ttl

  const storage = createStorage({
    driver: memoryDriver(),
  })

  return unstorageCache({
    storage: resilient(storage, logger),
    base: `${prefix ?? config.values.application.name}:db`,
    ...(cacheTtl === undefined ? {} : { config: { px: cacheTtl } }),
  })
}

const BIGINT_TAG = '__uncache_bigint__'
const DATE_TAG = '__uncache_date__'
const BYTES_TAG = '__uncache_bytes__'

/**
 * drizzle 把**未映射的驱动原始行**交给缓存（映射发生在其后），
 * 而 `Bun.SQL` 的 `.values()` 会返回 `BigInt` 与 `Date`——`unstorage`
 * 用 `JSON.stringify` 存储，遇到 `BigInt` 会直接抛错。
 *
 * 因此入库前把这两类值打标成 JSON 安全的形式，读取时再还原，
 * 保证缓存命中与直查得到同样的原始类型。
 */
function toStorable(value: unknown): unknown {
  if (typeof value === 'bigint') return { [BIGINT_TAG]: value.toString() }
  if (value instanceof Date) return { [DATE_TAG]: value.toISOString() }
  if (value instanceof Uint8Array) {
    return { [BYTES_TAG]: Buffer.from(value).toString('base64') }
  }
  if (Array.isArray(value)) return value.map(toStorable)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        toStorable(item),
      ])
    )
  }
  return value
}

function fromStorable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(fromStorable)
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record[BIGINT_TAG] === 'string') {
      return BigInt(record[BIGINT_TAG] as string)
    }
    if (typeof record[DATE_TAG] === 'string') {
      return new Date(record[DATE_TAG] as string)
    }
    if (typeof record[BYTES_TAG] === 'string') {
      return Buffer.from(record[BYTES_TAG] as string, 'base64')
    }
    return Object.fromEntries(
      Object.entries(record).map(([key, item]) => [key, fromStorable(item)])
    )
  }
  return value
}

/**
 * 包装缓存存储：
 * - 读写出入做安全序列化（见 {@link toStorable}）；
 * - 后端不可用时降级为 cache miss，而不是让业务查询失败
 *  （`getItem` 返回 miss，`getKeys` 返回空，写操作静默忽略）。
 */
/**
 * 后端不可用时的降级返回值：
 * `getKeys` 返回空数组，其余返回 `undefined`（即 cache miss）。
 */
function fallbackFor(method: PropertyKey): unknown {
  return method === 'getKeys' ? ([] as string[]) : undefined
}

/**
 * 把出参里不可 JSON 化的值转成可存储形式（见 {@link toStorable}）。
 */
function encodeCall(method: PropertyKey, args: unknown[]): unknown[] {
  if (method === 'setItem') {
    return [args[0], toStorable(args[1]), ...args.slice(2)]
  }
  if (method === 'setItems' && Array.isArray(args[0])) {
    // 这里拿到的是本次调用新建的 items，直接就地转换即可
    const items = args[0] as { key: string; value: unknown }[]
    for (const item of items) {
      item.value = toStorable(item.value)
    }
    return [items, ...args.slice(1)]
  }
  return args
}

/**
 * 包装缓存存储：
 * - 读写出入做安全序列化（见 {@link toStorable}）；
 * - 后端不可用时降级为 cache miss，而不是让业务查询失败
 *   （`getItem` 返回 miss，`getKeys` 返回空，写操作静默忽略）；
 * - 每次故障只告警一行：缓存读写很频繁，逐次告警会把日志刷满。
 */
function resilient(storage: Storage, logger: Logger): Storage {
  let outage = false

  const report = (error: unknown) => {
    if (outage) return
    outage = true
    logger.warn('查询缓存后端不可用，本次降级为 cache miss', { error })
  }

  const recovered = () => {
    outage = false
  }

  return new Proxy(storage, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      if (typeof value !== 'function') return value
      return (...args: unknown[]) => {
        const call = encodeCall(prop, args)
        try {
          const result = (value as (...a: unknown[]) => unknown).apply(
            target,
            call
          )
          if (result instanceof Promise) {
            return result.then(
              (resolved) => {
                recovered()
                return prop === 'getItem' ? fromStorable(resolved) : resolved
              },
              (error: unknown) => {
                report(error)
                return fallbackFor(prop)
              }
            )
          }
          recovered()
          return result
        } catch (error) {
          report(error)
          return fallbackFor(prop)
        }
      }
    },
  })
}
