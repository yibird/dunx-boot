import { SysCaptchaLogEventModule } from './captcha-log'
import { SysLoginLogEventModule } from './login-log'
import { SysOperationLogEventModule } from './operation-log'
import { SysRequestLogEventModule } from './request-log'

export const sysEventModules = [
  SysCaptchaLogEventModule,
  SysLoginLogEventModule,
  SysOperationLogEventModule,
  SysRequestLogEventModule,
]
