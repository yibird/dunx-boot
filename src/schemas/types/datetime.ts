import { customType } from 'drizzle-orm/pg-core'
import { DateUtils } from '@/utils/date'

/**
 * 日期时间类型：数据库存 timestamp，JS 侧统一为格式化字符串 "YYYY-MM-DD HH:mm:ss"。
 *
 * `data` 只描述**非空**时的类型。可空列的可空性由 drizzle 的 `GetColumnData`
 * 依据 `.notNull()` 决定：`.notNull()` 推断为 `string`，否则推断为
 * `string | null`。若把 `data` 写成 `string | Date | null`，notNull 列也会带上
 * `null` 与 `Date`，与响应契约不一致。
 *
 * drizzle 在读写两侧都会对 `null` 短路（`GetColumnData` 之外，
 * `utils.js` 的 mapper 与 `sql/sql.js` 的 encoder 都有 `=== null` 判断），
 * 因此 `fromDriver` / `toDriver` 只会收到字符串。
 */
export const datetime = customType<{
  data: string
  driverData: string
}>({
  dataType() {
    return 'timestamp'
  },
  fromDriver(value) {
    return DateUtils.format(value)
  },
  toDriver(value) {
    return DateUtils.format(value)
  },
})

/**
 * 当前时间格式化字符串，用于 default / $onUpdate
 */
export const now = () => DateUtils.format(new Date())
