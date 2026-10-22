export interface ContextStore<T> {
  get(): T | undefined
  require(): T
  run<R>(value: T, callback: () => R): R
}
