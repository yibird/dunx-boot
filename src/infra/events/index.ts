import { EventBusModule } from '@dunx/core'

/**
 * 进程内领域事件总线：绑定 `EventBus` / `EventRegistry`，
 * 并在启动时订阅全图的 `@OnEvent`。全局发布，发布方与订阅方互不依赖。
 */
export const AppEventBusModule = EventBusModule
