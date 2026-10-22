import {
  HealthIndicator,
  MemoryIndicator,
  MemoryOptions,
  type ProbeResult,
} from '@dunx/http'

/**
 * 内存 RSS 探针（liveness 用）。
 *
 * 框架的 `MemoryIndicator` 刻意是非关键项，而且把 `critical` 声明成了字面量
 * `false`，继承它也改不掉——按它摘流量不会让进程少用内存，那是 readiness 的
 * 语义。这里放进 liveness 要的正是「超限即重启」，所以包一层把 critical
 * 提到 `true`，检查逻辑仍然交给框架的探针。
 */
export class AppMemoryIndicator extends HealthIndicator {
  readonly name = 'memory'
  override readonly critical = true

  readonly #inner: MemoryIndicator

  constructor(options: MemoryOptions) {
    super()
    this.#inner = new MemoryIndicator(options)
  }

  override check(): ProbeResult {
    return this.#inner.check()
  }
}
