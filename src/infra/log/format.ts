import { prettyFormat, type LogFormatter } from '@dunx/infra/logger'

/**
 * 开发环境的可读时间戳：UTC，`YYYY-MM-DD HH:mm:ssZ`。
 *
 * 生产（`FileTransport` + JSON）写的是 ISO UTC，dev 这里如果按本机时区
 * 格式化，两套日志就对不上了；跨环境排查时时间戳必须是同一个时区。
 */
export const devFormat: LogFormatter = (entry, level) => {
  return prettyFormat(
    { ...entry, timestamp: timestampOf(entry['timestamp']) },
    level
  )
}

function timestampOf(value: unknown): string {
  const date =
    typeof value === 'number'
      ? new Date(value)
      : typeof value === 'string'
        ? new Date(value)
        : undefined
  if (!date || Number.isNaN(date.getTime())) {
    // 不拿当前时间兜底：那会给一条时间戳坏掉的日志盖上「刚刚」的假象
    return String(value)
  }
  return `${date.toISOString().replace('T', ' ').slice(0, 19)}Z`
}
