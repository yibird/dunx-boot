/**
 * 登录类型
 */
export const SYS_LOGIN_TYPE = {
  /**
   * 密码登录
   */
  PASSWORD_LOGIN: 1,
  /**
   * 短信登录
   */
  SMS_LOGIN: 2,
  /**
   * 邮箱登录
   */
  EMAIL_LOGIN: 3,
  /**
   * OAuth 登录
   */
  OAUTH_LOGIN: 4,
} as const

/**
 * 登录平台
 */
export const SYS_LOGIN_PLATFORM = {
  /**
   * Web 端
   */
  WEB: 1,
  /**
   * 移动端H5
   */
  H5: 2,
  /**
   * 移动端 App
   */
  APP: 3,
  /**
   * 微信小程序
   */
  WECHAT_MINI_PROGRAM: 4,
} as const

export type SysLoginType = ValueOf<typeof SYS_LOGIN_TYPE>
export type SysLoginPlatform = ValueOf<typeof SYS_LOGIN_PLATFORM>
