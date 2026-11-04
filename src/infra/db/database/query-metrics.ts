import type { HistogramSnapshot } from '@dunx/core'

/**
 * SQL 操作分类，与 `SysQueryMetrics` 的枚举保持一致。
 */
export const QUERY_OPERATIONS = [
  'select',
  'insert',
  'update',
  'delete',
  'other',
] as const

export type QueryOperation = (typeof QUERY_OPERATIONS)[number]

export interface QueryStats {
  operation: QueryOperation
  count: number
  errors: number
  /** 纳秒 */
  duration: HistogramSnapshot
  /** 最慢语句的脱敏形状 */
  slowest?: string
}

export interface DbStatsReport {
  operations: readonly QueryStats[]
  total: number
  since: string
}

/** 每个操作保留的耗样本数量；只用于分位数，不影响 count。 */
const RESERVOIR = 1024
const MAX_SLOWEST = 500

interface OperationState {
  count: number
  errors: number
  durations: number[]
  slowestMs: number
  slowestSql?: string
}

const emptyState = (): OperationState => ({
  count: 0,
  errors: 0,
  durations: [],
  slowestMs: -1,
})

/**
 * 轻量查询指标。
 *
 * 不依赖 `@dunx/infra/db`（它会连带加载 `drizzle-orm/bun-sqlite`，与当前
 * drizzle rc 不兼容）。接口形状与框架的 `QueryMetrics` 一致，`SysQueryMetrics`
 * 可以直接承接。
 */
export class QueryMetrics {
  readonly #since = new Date().toISOString()
  readonly #states = new Map<QueryOperation, OperationState>()

  /**
   * 记录一次查询。
   *
   * @param sql 原始 SQL，仅用于分类与慢语句快照
   * @param durationNs 耗时（纳秒）
   * @param failed 是否失败
   */
  observe(sql: string, durationNs: number, failed = false) {
    const operation = operationOf(sql)
    let state = this.#states.get(operation)
    if (!state) {
      state = emptyState()
      this.#states.set(operation, state)
    }
    state.count++
    if (failed) state.errors++

    if (state.durations.length < RESERVOIR) {
      state.durations.push(durationNs)
    } else {
      // 蓄水池采样，固定内存下保持近似分位数。
      const index = Math.floor(Math.random() * state.count)
      if (index < RESERVOIR) state.durations[index] = durationNs
    }

    const durationMs = durationNs / 1e6
    if (durationMs > state.slowestMs) {
      state.slowestMs = durationMs
      state.slowestSql = redact(sql)
    }
  }

  snapshot(): DbStatsReport {
    const operations: QueryStats[] = []
    let total = 0
    for (const operation of QUERY_OPERATIONS) {
      const state = this.#states.get(operation)
      if (!state || state.count === 0) continue
      total += state.count
      operations.push({
        operation,
        count: state.count,
        errors: state.errors,
        duration: summarize(state.durations),
        ...(state.slowestSql ? { slowest: state.slowestSql } : {}),
      })
    }
    return { operations, total, since: this.#since }
  }
}

const WRITE_OR_READ = new Set<QueryOperation>([
  'select',
  'insert',
  'update',
  'delete',
])

/**
 * 解析语句的顶层操作类型。
 *
 * 只扫描括号外的关键字：CTE（`WITH ... AS (...)`）内部的 select
 * 不会被误判为整条语句的操作，而 `WITH` 之后的顶层 select/insert/
 * update/delete 会被正确识别。
 */
function operationOf(sql: string): QueryOperation {
  const cleaned = sql
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
  let depth = 0
  let quote: string | null = null
  let word = ''

  const takeWord = () => {
    if (!word) return undefined
    const lower = word.toLowerCase()
    word = ''
    return lower
  }

  for (const char of cleaned) {
    if (quote) {
      if (char === quote) quote = null
      continue
    }
    if (char === "'" || char === '"') {
      quote = char
      continue
    }
    if (char === '(') {
      depth++
      continue
    }
    if (char === ')') {
      depth = Math.max(0, depth - 1)
      continue
    }
    if (depth > 0) continue

    if (/[a-z]/i.test(char)) {
      word += char
      continue
    }

    const current = takeWord()
    if (current && WRITE_OR_READ.has(current as QueryOperation)) {
      return current as QueryOperation
    }
  }

  const last = takeWord()
  return last && WRITE_OR_READ.has(last as QueryOperation)
    ? (last as QueryOperation)
    : 'other'
}

function redact(sql: string): string {
  const shape = sql
    .replaceAll(/\$\d+/g, '?')
    .replaceAll(/'(?:[^']|'')*'/g, '?')
    .replaceAll(/\b\d+(?:\.\d+)?\b/g, '?')
    .replaceAll(/\s+/g, ' ')
    .trim()
  return shape.length > MAX_SLOWEST ? `${shape.slice(0, MAX_SLOWEST)}…` : shape
}

function summarize(durations: readonly number[]): HistogramSnapshot {
  if (durations.length === 0) return { count: 0 }
  const sorted = [...durations].sort((a, b) => a - b)
  const at = (percent: number) =>
    sorted[
      Math.min(
        sorted.length - 1,
        Math.max(0, Math.ceil(percent * sorted.length) - 1)
      )
    ]!
  return {
    count: durations.length,
    min: sorted[0]!,
    max: sorted[sorted.length - 1]!,
    p50: at(0.5),
    p90: at(0.9),
    p95: at(0.95),
    p99: at(0.99),
    p999: at(0.999),
  }
}
