import { SysAuthModule } from './auth'
import { SysRoleModule } from './role'
import { SysPostModule } from './post'
import { SysDictTypeModule } from './dict-type'
import { SysOperationLogModule } from './operation-log'
import { SysDeptModule } from './dept'
import { SysUserModule } from './user'
import { SysMenuModule } from './menu'
import { SysTenantModule } from './tenant'
import { SysCaptchaLogModule } from './captcha-log'
import { SysLoginLogModule } from './login-log'
import { SysRequestLogModule } from './request-log'
import { SysNoticeModule } from './notice'
import { SysMessageModule } from './message'

export const SysModules = [
  SysAuthModule,
  SysRoleModule,
  SysPostModule,
  SysDeptModule,
  SysUserModule,
  SysMenuModule,
  SysTenantModule,
  SysDictTypeModule,
  SysOperationLogModule,
  SysCaptchaLogModule,
  SysLoginLogModule,
  SysRequestLogModule,
  SysNoticeModule,
  SysMessageModule,
]
