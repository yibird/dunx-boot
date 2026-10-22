import { ApiStatus, ApiStatusMessage } from '@/constants'
import { AppError, BadRequestError } from '@/errors'

export type AssertionError = string | AppError | (() => string)

/**
 * 断言工具类
 */
export class AssertUtils {
  private constructor() {}

  /**
   * 断言值不为 null 或 undefined。
   *
   * @param value 待断言的值
   * @param error 断言失败时的错误信息或应用错误
   */
  static notNull<T>(
    value: T,
    error: AssertionError
  ): asserts value is NonNullable<T> {
    if (value === null || value === undefined) this.#toError(error)
  }

  /**
   * 断言值为 null 或 undefined。
   *
   * @param value 待断言的值
   * @param error 断言失败时的错误信息或应用错误
   */
  static isNull(
    value: unknown,
    error: AssertionError
  ): asserts value is null | undefined {
    if (value !== null && value !== undefined) this.#toError(error)
  }

  /**
   * 断言字符串包含非空白字符。
   *
   * @param value 待断言的字符串
   * @param error 断言失败时的错误信息或应用错误
   */
  static hasText(
    value: string | null | undefined,
    error: AssertionError
  ): asserts value is string {
    if (value === null || value === undefined || value.trim().length === 0) {
      this.#toError(error)
    }
  }

  /**
   * 断言字符串不为空白。
   *
   * @param value 待断言的字符串
   * @param error 断言失败时的错误信息或应用错误
   */
  static notBlank(
    value: string | null | undefined,
    error: AssertionError
  ): asserts value is string {
    if (!value || value.trim().length === 0) {
      this.#toError(error)
    }
  }

  /**
   * 断言条件为 true。
   *
   * @param condition 待断言的条件
   * @param error 断言失败时的错误信息或应用错误
   */
  static isTrue(
    condition: boolean,
    error: AssertionError
  ): asserts condition is true {
    if (!condition) this.#toError(error)
  }

  /**
   * 断言条件为 false。
   *
   * @param condition 待断言的条件
   * @param error 断言失败时的错误信息或应用错误
   */
  static isFalse(
    condition: boolean,
    error: AssertionError
  ): asserts condition is false {
    if (condition) this.#toError(error)
  }

  /**
   * 断言可变数组不为空。
   *
   * @param collection 待断言的数组
   * @param error 断言失败时的错误信息或应用错误
   */
  static notEmpty<T>(
    collection: T[] | null | undefined,
    error: AssertionError
  ): asserts collection is [T, ...T[]]

  /**
   * 断言只读数组不为空。
   *
   * @param collection 待断言的只读数组
   * @param error 断言失败时的错误信息或应用错误
   */
  static notEmpty<T>(
    collection: readonly T[] | null | undefined,
    error: AssertionError
  ): asserts collection is readonly [T, ...T[]]

  static notEmpty<T>(
    collection: readonly T[] | null | undefined,
    error: AssertionError
  ) {
    if (!collection || collection.length === 0) this.#toError(error)
  }

  /**
   * 断言数值为有限正数。
   *
   * @param value 待断言的数值
   * @param error 断言失败时的错误信息或应用错误
   */
  static isPositive(value: number, error: AssertionError) {
    if (!Number.isFinite(value) || value <= 0) this.#toError(error)
  }

  /**
   * 断言两个值相等。
   *
   * @param a 第一个值
   * @param b 第二个值
   * @param error 断言失败时的错误信息或应用错误
   */
  static equal<T>(a: T, b: T, error: AssertionError): asserts a is T {
    if (a !== b) {
      this.#toError(error)
    }
  }

  /**
   * 断言两个值不相等。
   *
   * @param a 第一个值
   * @param b 第二个值
   * @param error 断言失败时的错误信息或应用错误
   */
  static notEqual<T>(a: T, b: T, error: AssertionError) {
    if (a === b) {
      this.#toError(error)
    }
  }

  /**
   * 断言集合包含指定元素。
   *
   * @param collection 待断言的集合
   * @param value 待检查的元素
   * @param error 断言失败时的错误信息或应用错误
   */
  static includes<T>(
    collection: readonly T[],
    value: T,
    error: AssertionError
  ) {
    if (!collection.includes(value)) {
      this.#toError(error)
    }
  }

  /**
   * 断言数值在指定范围内。
   *
   * @param value 待断言的数值
   * @param min 最小值（包含）
   * @param max 最大值（包含）
   * @param error 断言失败时的错误信息或应用错误
   */
  static inRange(
    value: number,
    min: number,
    max: number,
    error: AssertionError
  ) {
    if (!Number.isFinite(value) || value < min || value > max) {
      this.#toError(error)
    }
  }

  /**
   * 断言对象包含指定属性。
   *
   * @param value 待断言的对象
   * @param key 待检查的属性
   * @param error 断言失败时的错误信息或应用错误
   */
  static containsKey(value: object, key: PropertyKey, error: AssertionError) {
    if (!(key in value)) {
      this.#toError(error)
    }
  }

  /**
   * 断言值 instanceof 某类型。
   *
   * @param value 待断言的值
   * @param type 待检查的类型
   * @param error 断言失败时的错误信息或应用错误
   */
  static isInstanceOf<T>(
    value: unknown,
    type: new (...args: unknown[]) => T,
    error: AssertionError
  ): asserts value is T {
    if (!(value instanceof type)) {
      this.#toError(error)
    }
  }

  /**
   * 断言失败时抛出错误
   *
   * @param error 错误信息、应用错误或其工厂函数
   * @return 永不返回
   */
  static #toError(error: AssertionError): never {
    if (typeof error === 'string') throw new BadRequestError(error)
    throw typeof error === 'function' ? error() : error
  }

  /**
   * 执行同步或异步操作，将未知异常包装为不对外暴露的应用错误。
   *
   * @param operation 待执行的操作
   * @param callback 未知异常对应的服务端错误信息
   * @return 操作结果
   */
  static async tryTo<T>(
    operation: () => T | PromiseLike<T>,
    callback?: () => string | void
  ) {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof AppError) throw error
      const message = callback?.() ?? ApiStatusMessage[ApiStatus.NOT_FOUND]
      throw new AppError({
        message,
        expose: false,
        cause: error,
      })
    }
  }

  /**
   * 执行操作，并在成功或失败时调用回调。
   *
   * @param operation 待执行的操作
   * @param callback 处理操作结果或异常的回调
   * @returns 操作结果，失败时返回 undefined
   */
  static async execute<T>(
    operation: () => T | Promise<T>,
    callback: (result: T | undefined, error?: unknown) => void
  ): Promise<T | undefined> {
    let result: T
    try {
      result = await operation()
    } catch (error) {
      callback(undefined, error)
      return undefined
    }
    callback(result, undefined)
    return result
  }

  /**
   * 执行操作，并仅在成功时调用回调。
   *
   * @param operation 待执行的操作
   * @param callback 操作成功后的回调
   * @returns 操作结果，失败时返回 undefined
   */
  static async executeOnSuccess<T>(
    operation: () => T | Promise<T>,
    callback: (result: T) => void
  ): Promise<T | undefined> {
    let result: T
    try {
      result = await operation()
    } catch {
      return undefined
    }
    callback(result)
    return result
  }

  /**
   * 执行操作，并仅在失败时调用回调。
   *
   * @param operation 待执行的操作
   * @param callback 操作失败后的回调
   * @returns 操作结果，失败时返回 undefined
   */
  static async executeOnError<T>(
    operation: () => T | Promise<T>,
    callback: (error: unknown) => void
  ): Promise<T | undefined> {
    try {
      return await operation()
    } catch (error) {
      callback(error)
      return undefined
    }
  }
}
