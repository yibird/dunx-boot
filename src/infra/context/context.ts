import { AsyncLocalStorage } from 'node:async_hooks'
import type { ContextStore } from './types'

/**
 * 创建一个作用域上下文存储。
 *
 * @param name 上下文名称，用于缺省错误消息
 * @param onMissing 取不到值时的错误工厂，默认抛普通 `Error`
 * @return 上下文存储
 */
export function createContext<T>(
  name: string,
  onMissing: () => Error = () => new Error(`${name} context is not available`)
): ContextStore<T> {
  const storage = new AsyncLocalStorage<T>()
  return {
    get() {
      return storage.getStore()
    },
    require() {
      const value = storage.getStore()
      if (value === undefined) {
        throw onMissing()
      }
      return value
    },
    run<R>(value: T, callback: () => R) {
      return storage.run(value, callback)
    },
  }
}
