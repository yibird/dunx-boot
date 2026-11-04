/**
 * 验证码日志事件载荷
 */
export interface SysCaptchaLogEventPayload {
  /**
   * 业务侧验证码唯一标识
   */
  captchaId: string
  /**
   * 验证码类型
   */
  captchaType: number
  /**
   * 脱敏后的接收目标（手机号、邮箱）
   */
  target?: string | undefined
  /**
   * 有效期（毫秒），缺省按图片验证码算
   */
  ttl?: number | undefined
  /**
   * 其余上下文，原样存入 `payload` 列
   */
  payload?: Record<string, unknown> | undefined
}
