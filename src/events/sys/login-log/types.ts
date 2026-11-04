import type { SysLoginPlatform, SysLoginType } from '@/constants'

/**
 * 登录日志事件载荷
 */
export interface SysLoginLogEventPayload {
  /**
   * 登录事件类型，取值见 `SYS_LOGIN_TYPE`
   */
  loginType: SysLoginType
  /**
   * 是否成功
   */
  status: boolean
  /**
   * 相关用户 id；登录成功、账号存在这类「动作里才知道」的信息由调用方补上
   */
  userId?: string | undefined
  /**
   * 登录username
   */
  username: string
  /**
   * 登录平台
   */
  platform: SysLoginPlatform
  /**
   * 登录失败原因
   */
  failReason?: string | undefined
  /**
   * 载荷
   */
  payload?: Record<string, unknown> | undefined
}
