export const REDIS_NAMESPACE = 'dunx-boot'

/**
 * Redis键前缀
 */
export const REDIS_KEY_PREFIX = {
  /**
   * 图片验证码前缀
   */
  IMAGE_CAPTCHA: (value: string) => `${REDIS_NAMESPACE}:imageCaptcha:${value}`,
  /**
   * 短信验证码前缀
   */
  SMS_CAPTCHA: (value: string) => `${REDIS_NAMESPACE}:smsCaptcha:${value}`,
  /**
   * 账号登录前缀
   */
  ACCOUNT_TOKEN: (value: string) => `${REDIS_NAMESPACE}:accountToken:${value}`,
  /**
   * 刷新token前缀
   */
  REFRESH_TOKEN: (value: string) => `${REDIS_NAMESPACE}:refreshToken:${value}`,
}

/**
 * Redis键过期时间(毫秒)
 */
export const REDIS_KEY_TTL = {
  /**
   * 图片验证码过期时间(毫秒)
   */
  IMAGE_CAPTCHA: 5 * 60 * 1000,
  /**
   * 短信验证码过期时间(毫秒)
   */
  SMS_CAPTCHA: 5 * 60 * 1000,
}
