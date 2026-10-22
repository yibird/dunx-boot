import { z } from 'zod'
import { SYS_LOGIN_PLATFORM } from '../login-log'
import { createSelectSchema } from 'drizzle-orm/zod'
import { sysAuthToken } from '@/schemas'

export const SysAuthTokenSchema = createSelectSchema(sysAuthToken)

const phoneSchema = z
  .string()
  .regex(/^1[3-9]\d{9}$/, '手机号格式不正确')
  .meta({ description: '手机号' })
const accountSchema = z.string().min(4, '账号至少 4 位').max(64)
const passwordSchema = z.string().min(6, '密码至少 6 位').max(64)
const captchaIdSchema = z.string().min(1).meta({ description: '验证码标识' })
const captchaSchema = z.string().min(1).max(16).meta({ description: '验证码' })
const platformSchema = z
  .number()
  .optional()
  .default(SYS_LOGIN_PLATFORM.WEB)
  .meta({
    description: '登录平台',
    examples: [SYS_LOGIN_PLATFORM.WEB, SYS_LOGIN_PLATFORM.H5],
  })

/**
 * 短信验证码请求Schema
 */
export const sysAuthSmsCaptchaReqSchema = z
  .object({ phone: phoneSchema })
  .meta({ id: 'SysAuthSmsCaptchaReq' })

/**
 * 短信验证码请求Schema
 */
export const sysAuthImageCaptchaReqSchema = z
  .object({
    captchaId: captchaIdSchema,
    captcha: captchaSchema,
  })
  .meta({ id: 'SysAuthImageCaptchaReq' })

/**
 * 短信验证码响应Schema
 */
export const sysAuthSmsCaptchaRespSchema = z
  .object({
    captchaId: z.string().meta({ description: '验证码标识' }),
  })
  .meta({ id: 'SysAuthSmsCaptcha', description: '短信验证码' })

/**
 * 图形验证码响应Schema
 */
export const sysAuthImageCaptchaRespSchema = z
  .object({
    captchaId: z
      .string()
      .meta({ description: '验证码标识', example: 'huasdhoasdn' }),
    captcha: z.string().meta({
      description: '验证码图片(SVG data URL)',
      example: 'huasdhoasdn',
    }),
  })
  .meta({ id: 'SysAuthImageCaptcha', description: '图形验证码' })

/**
 * 账号登录请求Schema
 */
export const sysAuthAccountLoginReqSchema = z
  .object({
    account: accountSchema,
    password: passwordSchema,
    captchaId: captchaIdSchema,
    captcha: captchaSchema,
    platform: platformSchema,
  })
  .meta({ id: 'SysAuthLoginReq' })

/**
 * 手机号登录请求Schema
 */
export const sysAuthPhoneLoginReqSchema = z
  .object({
    phone: phoneSchema,
    captchaId: captchaIdSchema,
    captcha: captchaSchema,
    platform: platformSchema,
  })
  .meta({ id: 'SysAuthPhoneLoginReq' })

/**
 * 二维码登录Schema
 */
export const sysAuthQrLoginReqSchema = z
  .strictObject({
    sessionId: z.uuid().meta({ description: '会话 ID' }),
    challenge: z
      .string()
      .regex(/^[A-Za-z0-9_-]{43}$/)
      .meta({ description: '二维码挑战值' }),
    accessToken: z.string().min(1).max(8192).meta({ description: '访问令牌' }),
  })
  .meta({ id: 'SysAuthQrLoginReq' })

/**
 * 注册请求Schema
 */
export const sysAuthAccountRegisterReqSchema = z
  .object({
    account: accountSchema,
    password: passwordSchema,
    captchaId: captchaIdSchema,
    captcha: captchaSchema,
  })
  .meta({ id: 'SysAuthAccountRegisterReq' })

export const sysAuthEmailRegisterReqSchema = z
  .object({
    email: z.email().meta({ description: '邮箱' }),
    password: passwordSchema,
    captchaId: captchaIdSchema,
    captcha: captchaSchema,
  })
  .meta({ id: 'SysAuthEmailRegisterReq' })

export const sysAuthPhoneRegisterReqSchema = z
  .object({
    phone: phoneSchema,
    password: passwordSchema,
    captchaId: captchaIdSchema,
    captcha: captchaSchema,
  })
  .meta({ id: 'SysAuthPhoneRegisterReq' })

/**
 * 认证用户信息Schema
 */
export const sysAuthUserSchema = z
  .object({
    id: z.string(),
    account: z.string(),
    nickname: z.string(),
    avatar: z.string().nullable(),
    phone: z.string().nullable(),
    tenantId: z.string(),
    roleId: z.string().nullable(),
  })
  .meta({ id: 'SysAuthUser', description: '认证用户信息' })

/**
 * 登录会话Schema
 */
export const sysAuthSessionSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
    tokenType: z.literal('Bearer'),
    user: sysAuthUserSchema,
  })
  .meta({ id: 'SysAuthSession', description: '登录会话' })

// ====================== 验证码
export type SysAuthSmsCaptchaReq = z.infer<typeof sysAuthSmsCaptchaReqSchema>
export type SysAuthImageCaptchaReq = z.infer<
  typeof sysAuthImageCaptchaReqSchema
>
export type SysAuthSmsCaptchaResp = z.infer<typeof sysAuthSmsCaptchaRespSchema>
export type SysAuthImageCaptchaResp = z.infer<
  typeof sysAuthImageCaptchaRespSchema
>

// ====================== 注册与登录
export type SysAuthAccountLoginReq = z.infer<
  typeof sysAuthAccountLoginReqSchema
>
export type SysAuthPhoneLoginReq = z.infer<typeof sysAuthPhoneLoginReqSchema>
export type SysAuthQrLoginReq = z.infer<typeof sysAuthQrLoginReqSchema>
export type SysAuthAccountRegisterReq = z.infer<
  typeof sysAuthAccountRegisterReqSchema
>
export type SysAuthEmailRegisterReq = z.infer<
  typeof sysAuthEmailRegisterReqSchema
>
export type SysAuthPhoneRegisterReq = z.infer<
  typeof sysAuthPhoneRegisterReqSchema
>

// ====================== 认证用户信息
export type SysAuthUser = z.infer<typeof sysAuthUserSchema>
export type SysAuthSession = z.infer<typeof sysAuthSessionSchema>
