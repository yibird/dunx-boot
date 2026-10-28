/**
 * 登录类型
 */
export const SYS_LOGIN_TYPE = {
  /**
   * 密码登录
   */
  Password: 1,
  /**
   * 短信登录
   */
  Sms: 2,
  /**
   * 邮箱登录
   */
  Email: 3,
  /**
   * OAuth 登录
   */
  OAuth: 4,
} as const

export const SYS_LOGIN_PLATFORM = {
  /**
   * Web 端 (PC 浏览器)
   */
  Web: 1,
  /**
   * 移动端 H5
   */
  H5: 2,
  /**
   * 移动端 App
   */
  App: 3,
  /**
   * 微信小程序
   */
  WechatMiniProgram: 4,
} as const

export type SysLoginType = ValueOf<typeof SYS_LOGIN_TYPE>
export type SysLoginPlatform = ValueOf<typeof SYS_LOGIN_PLATFORM>
