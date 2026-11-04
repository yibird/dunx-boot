import type { PgTable } from 'drizzle-orm/pg-core'
import type {
  CreateContext,
  DeleteContext,
  QueryContext,
  ResultContext,
  UpdateContext,
} from './types'
import { PluginPriority } from './constant'

/**
 * CRUD 插件接口
 *
 * 插件在操作前后提供拦截点，可以修改查询条件、写入数据、处理结果等。
 * 所有钩子方法都是可选的，只实现需要的即可。
 */
export interface CrudPlugin<TTable extends PgTable = PgTable> {
  /**
   * 插件名称（唯一标识）
   */
  readonly name: string

  /**
   * 优先级（数字越小越先执行，默认 100）
   */
  readonly priority?: number

  /**
   * 查询前拦截
   *
   * 可以修改 context.options 中的 where、orderBy 等
   */
  beforeQuery?(context: QueryContext<TTable>): void | Promise<void>

  /**
   * 创建前拦截
   *
   * 可以修改 context.values
   */
  beforeCreate?(context: CreateContext<TTable>): void | Promise<void>

  /**
   * 更新前拦截
   *
   * 可以修改 context.values 和 context.where
   */
  beforeUpdate?(context: UpdateContext<TTable>): void | Promise<void>

  /**
   * 删除前拦截
   *
   * 可以修改 context.where、context.softDelete、context.values
   */
  beforeDelete?(context: DeleteContext<TTable>): void | Promise<void>

  /**
   * 查询后拦截
   *
   * 可以修改 context.result
   */
  afterQuery?(context: ResultContext<TTable>): void | Promise<void>

  /**
   * 创建后拦截
   */
  afterCreate?(context: ResultContext<TTable>): void | Promise<void>

  /**
   * 更新后拦截
   */
  afterUpdate?(context: ResultContext<TTable>): void | Promise<void>

  /**
   * 删除后拦截
   */
  afterDelete?(context: ResultContext<TTable>): void | Promise<void>
}

/**
 * 插件管理器
 */
export class PluginManager<TTable extends PgTable = PgTable> {
  readonly #plugins: CrudPlugin<TTable>[]

  constructor(plugins: CrudPlugin<TTable>[] = []) {
    // 按优先级排序
    this.#plugins = [...plugins].sort((a, b) => {
      return (
        (a.priority ?? PluginPriority.DEFAULT) -
        (b.priority ?? PluginPriority.DEFAULT)
      )
    })
  }

  /**
   * 执行查询前钩子
   */
  async beforeQuery(context: QueryContext<TTable>): Promise<void> {
    for (const plugin of this.#plugins) {
      if (plugin.beforeQuery) {
        await plugin.beforeQuery(context)
      }
    }
  }

  /**
   * 执行创建前钩子
   */
  async beforeCreate(context: CreateContext<TTable>): Promise<void> {
    for (const plugin of this.#plugins) {
      if (plugin.beforeCreate) {
        await plugin.beforeCreate(context)
      }
    }
  }

  /**
   * 执行更新前钩子
   */
  async beforeUpdate(context: UpdateContext<TTable>): Promise<void> {
    for (const plugin of this.#plugins) {
      if (plugin.beforeUpdate) {
        await plugin.beforeUpdate(context)
      }
    }
  }

  /**
   * 执行删除前钩子
   */
  async beforeDelete(context: DeleteContext<TTable>): Promise<void> {
    for (const plugin of this.#plugins) {
      if (plugin.beforeDelete) {
        await plugin.beforeDelete(context)
      }
    }
  }

  /**
   * 执行查询后钩子
   */
  async afterQuery(context: ResultContext<TTable>): Promise<void> {
    for (const plugin of this.#plugins) {
      if (plugin.afterQuery) {
        await plugin.afterQuery(context)
      }
    }
  }

  /**
   * 执行创建后钩子
   */
  async afterCreate(context: ResultContext<TTable>): Promise<void> {
    for (const plugin of this.#plugins) {
      if (plugin.afterCreate) {
        await plugin.afterCreate(context)
      }
    }
  }

  /**
   * 执行更新后钩子
   */
  async afterUpdate(context: ResultContext<TTable>): Promise<void> {
    for (const plugin of this.#plugins) {
      if (plugin.afterUpdate) {
        await plugin.afterUpdate(context)
      }
    }
  }

  /**
   * 执行删除后钩子
   */
  async afterDelete(context: ResultContext<TTable>): Promise<void> {
    for (const plugin of this.#plugins) {
      if (plugin.afterDelete) {
        await plugin.afterDelete(context)
      }
    }
  }
}
