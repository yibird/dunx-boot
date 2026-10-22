import type { OnShutdown } from '@dunx/core'
import type { DbHandle, DbSchema } from './db'
import { DbLifecycle } from './lifecycle'

/**
 * 持有 Drizzle 实例和连接池，业务 provider 停止后再释放连接。
 */
export class DbConnection<R extends DbSchema> implements OnShutdown {
  readonly #lifecycle: DbLifecycle

  constructor(readonly db: DbHandle<R>) {
    this.#lifecycle = new DbLifecycle(db.$client)
  }

  async onShutdown(): Promise<void> {
    await this.#lifecycle.onShutdown()
  }
}
