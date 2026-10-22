declare global {
  /**
   * 键值对的键类型。
   */
  type Key = number | string | bigint

  /**
   * 一个可能为 `null` 或 `undefined` 的值。
   */
  type Nullable<T> = T | null | undefined

  /**
   * 获取对象所有 value 的联合类型
   */
  type ValueOf<T> = T[keyof T]

  /**
   * 获取对象所有 key 的联合类型
   */
  export type KeyOf<T> = keyof T

  /**
   * 一个可能以异步方式提供的值。
   */
  type Awaitable<T> = T | PromiseLike<T>

  /**
   * 类型的深度可选变体（用于配置合并）。
   */
  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
  }

  /**
   * 深度只读。
   *
   * 只对「真正的对象」递归：函数、原始类型（含 `undefined`）原样返回。
   * 朴素的 `{ readonly [K in keyof T]: ... }` 会把函数映射成 `{}`——调用签名
   * 直接消失，`config.values.security.cors.origin` 里那个
   * `(origin: string) => boolean` 会变成不可调用的空对象，把配置交给框架时
   * 只能靠 `as` 掩盖。
   */
  type DeepReadonly<T> = T extends (...args: never[]) => unknown
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T
}
export {}
