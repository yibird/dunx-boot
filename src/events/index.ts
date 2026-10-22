import { Module } from '@dunx/core'
import { sysEventModules } from './sys'

/**
 * 领域事件监听方：把 `src/events/sys` 下各个模块的 `@OnEvent` 挂上总线。
 *
 * 发布方只依赖事件类（`@/events` 的命名导出），监听方只依赖仓储，
 * 两边通过总线解耦——这是请求日志、登录日志、验证码日志的统一接法。
 */
@Module({
  imports: [...sysEventModules],
  exports: [],
})
export class EventListenerModule {}

export {
  SysCaptchaLogEvent,
  SysLoginLogEvent,
  SysOperationLogEvent,
  SysRequestLogEvent,
} from './sys'
export type {
  SysCaptchaLogEventPayload,
  SysLoginLogEventPayload,
  SysRequestLogEventPayload,
} from './sys'
