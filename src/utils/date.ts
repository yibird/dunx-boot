import {
  add,
  differenceInDays,
  differenceInHours,
  differenceInMilliseconds,
  differenceInMinutes,
  differenceInMonths,
  differenceInQuarters,
  differenceInSeconds,
  differenceInWeeks,
  differenceInYears,
  format,
  formatDistanceToNow,
  isValid as isValidDate,
} from 'date-fns'

type DateInput = Date | number | string

type DateUnit =
  | 'year'
  | 'quarter'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'

type DateDiffUnit = DateUnit | 'millisecond'

export const DATE_FORMAT = {
  DATETIME: 'yyyy-MM-dd HH:mm:ss',
  DATE: 'yyyy-MM-dd',
  TIME: 'HH:mm:ss',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const

/** 时长简写支持的毫秒换算倍率。 */
const DURATION_UNIT_MS = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
} as const

function toDate(input: DateInput) {
  return input instanceof Date ? input : new Date(input)
}

/**
 * 日期/时间辅助工具。
 *
 * 将日期逻辑集中于此，而不是到处散落 `new Date()`、
 * `toISOString()` 等调用，可保持格式一致，并使未来的
 * 时区、区域设置变更只需修改一个文件。
 */
export class DateUtils {
  private constructor() {}

  /**
   * 以 ISO-8601 字符串（UTC）表示的当前时间戳。
   *
   * @return 当前时间的 ISO-8601 UTC 字符串
   */
  static nowIso() {
    return new Date().toISOString()
  }

  /**
   * 当前 UNIX 纪元时间，单位为毫秒。
   *
   * @return 当前时间的毫秒级时间戳
   */
  static nowMs() {
    return Date.now()
  }

  /**
   * 当前 UNIX 纪元时间，单位为秒。
   *
   * @return 当前时间的秒级时间戳
   */
  static nowUnix() {
    return Math.floor(Date.now() / 1000)
  }

  /**
   * 将 `15m`、`2h`、`7d` 等时长简写转换为毫秒。
   *
   * @param duration 时长简写
   * @return 对应的毫秒数
   */
  static durationMs(duration: string) {
    const match = /^(\d+)([smhdw])$/i.exec(duration.trim())
    if (!match) {
      throw new TypeError(`Invalid duration: ${duration}`)
    }
    const amount = Number(match[1])
    const unit = match[2]!.toLowerCase() as keyof typeof DURATION_UNIT_MS
    return amount * DURATION_UNIT_MS[unit]
  }

  /**
   * 将日期转换为 ISO-8601 字符串。
   *
   * @param input 日期输入
   * @return 对应的 ISO-8601 UTC 字符串
   */
  static toIso(input: DateInput) {
    return toDate(input).toISOString()
  }

  /**
   * 使用给定的格式模式格式化日期。
   *
   * @param input 日期输入
   * @param pattern 格式模式，默认为 @link FORMAT.DATETIME
   * @return 按模式格式化后的日期字符串
   */
  static format(input: DateInput, pattern: string = DATE_FORMAT.DATETIME) {
    return format(toDate(input), pattern)
  }

  /**
   * `input` 是否为有效且可解析的日期。
   *
   * @param input 日期输入
   * @return 当输入为有效日期时返回 true
   */
  static isValid(input: DateInput) {
    return isValidDate(toDate(input))
  }

  /**
   * 增加 `amount` 个 `unit` 并返回 ISO-8601 字符串。
   *
   * @param input 日期输入
   * @param amount 要增加的数量
   * @param unit 时间单位
   * @return 增加后的 ISO-8601 字符串
   */
  static add(input: DateInput, amount: number, unit: DateUnit) {
    return add(toDate(input), {
      [unit]: amount,
    }).toISOString()
  }

  /**
   * 减去 `amount` 个 `unit` 并返回 ISO-8601 字符串。
   *
   * @param input 日期输入
   * @param amount 要减去的数量
   * @param unit 时间单位
   * @return 减去后的 ISO-8601 字符串
   */
  static subtract(input: DateInput, amount: number, unit: DateUnit) {
    return add(toDate(input), {
      [unit]: -amount,
    }).toISOString()
  }

  /**
   * 两个日期之间以给定 `unit` 表示的差值（默认毫秒）。
   *
   * @param d1 被减日期
   * @param d2 减去的日期
   * @param unit 差值单位，默认为毫秒
   * @return 两个日期之间的差值
   */
  static diff(
    d1: DateInput,
    d2: DateInput,
    unit: DateDiffUnit = 'millisecond'
  ) {
    const date1 = toDate(d1)
    const date2 = toDate(d2)

    switch (unit) {
      case 'year':
        return differenceInYears(date1, date2)
      case 'quarter':
        return differenceInQuarters(date1, date2)
      case 'month':
        return differenceInMonths(date1, date2)
      case 'week':
        return differenceInWeeks(date1, date2)
      case 'day':
        return differenceInDays(date1, date2)
      case 'hour':
        return differenceInHours(date1, date2)
      case 'minute':
        return differenceInMinutes(date1, date2)
      case 'second':
        return differenceInSeconds(date1, date2)
      case 'millisecond':
        return differenceInMilliseconds(date1, date2)
    }
  }

  /**
   * 相对于当前时间的人类可读相对时间，例如 `"3 hours ago"`。
   *
   * @param input 日期输入
   * @return 人类可读的相对时间字符串
   */
  static fromNow(input: DateInput) {
    return formatDistanceToNow(toDate(input), {
      addSuffix: true,
    })
  }
}
