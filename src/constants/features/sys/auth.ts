/**
 * 验证码类型
 */
export const SYS_CAPTCHA_TYPE = {
  /**
   * 图片验证码
   */
  Image: 1,
  /**
   * 短信验证码
   */
  Sms: 2,
} as const

/**
 * 验证码状态
 */
export const SYS_CAPTCHA_STATUS = {
  /**
   * 待处理
   */
  Pending: 1,
  /**
   * 成功
   */
  Success: 2,
  /**
   * 失败
   */
  Failed: 3,
  /**
   * 过期
   */
  Expired: 4,
} as const

export type SysCaptchaType = ValueOf<typeof SYS_CAPTCHA_TYPE>
export type SysCaptchaStatus = ValueOf<typeof SYS_CAPTCHA_STATUS>
