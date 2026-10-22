import { SysCaptchaLogEventModule, SysCaptchaLogEvent } from './captcha-log'
import { SysLoginLogEventModule, SysLoginLogEvent } from './login-log'
import {
  SysOperationLogEventModule,
  SysOperationLogEvent,
} from './operation-log'
import { SysRequestLogEventModule, SysRequestLogEvent } from './request-log'

export const sysEventModules = [
  SysCaptchaLogEventModule,
  SysLoginLogEventModule,
  SysOperationLogEventModule,
  SysRequestLogEventModule,
]

export {
  SysCaptchaLogEvent,
  SysLoginLogEvent,
  SysOperationLogEvent,
  SysRequestLogEvent,
}

export type { SysCaptchaLogEventPayload } from './captcha-log'
export type { SysLoginLogEventPayload } from './login-log'
export type { SysRequestLogEventPayload } from './request-log'
