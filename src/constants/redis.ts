export const REDIS_NAMESPACE = 'dunx-boot'

export const REDIS_KEY_PREFIX = {
  /**
   * 图片验证码前缀
   */
  ImageCaptcha: (value: string) => `${REDIS_NAMESPACE}:imageCaptcha:${value}`,
  /**
   * 短信验证码前缀
   */
  SmsCaptcha: (value: string) => `${REDIS_NAMESPACE}:smsCaptcha:${value}`,
  /**
   * 账号登录前缀
   */
  AccountToken: (value: string) => `${REDIS_NAMESPACE}:accountToken:${value}`,
  /**
   * 刷新token前缀
   */
  RefreshToken: (value: string) => `${REDIS_NAMESPACE}:refreshToken:${value}`,
} as const

/**
 * Redis键过期时间(毫秒)
 */
export const REDIS_KEY_TTL = {
  /**
   * 图片验证码过期时间(毫秒)
   */
  ImageCaptcha: 5 * 60 * 1000,
  /**
   * 短信验证码过期时间(毫秒)
   */
  SmsCaptcha: 5 * 60 * 1000,
} as const
