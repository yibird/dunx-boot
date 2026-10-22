import { z } from 'zod'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysLoginLog } from '@/schemas'
import { SYS_LOGIN_PLATFORM, SYS_LOGIN_TYPE } from './constant'
import { createSelectSchema } from 'drizzle-orm/zod'

export const sysLoginLogSchema = createSelectSchema(sysLoginLog, {
  loginType: z
    .union([
      z.literal(SYS_LOGIN_TYPE.PASSWORD_LOGIN),
      z.literal(SYS_LOGIN_TYPE.SMS_LOGIN),
      z.literal(SYS_LOGIN_TYPE.EMAIL_LOGIN),
      z.literal(SYS_LOGIN_TYPE.OAUTH_LOGIN),
    ])
    .optional()
    .nullable()
    .meta({
      description: '登录类型',
      examples: [SYS_LOGIN_TYPE.PASSWORD_LOGIN],
    }),
  platform: z
    .union([
      z.literal(SYS_LOGIN_PLATFORM.WEB),
      z.literal(SYS_LOGIN_PLATFORM.H5),
      z.literal(SYS_LOGIN_PLATFORM.APP),
      z.literal(SYS_LOGIN_PLATFORM.WECHAT_MINI_PROGRAM),
    ])
    .optional()
    .nullable()
    .meta({
      description: '登录平台',
      examples: [SYS_LOGIN_PLATFORM.WEB],
    }),
  userId: z
    .string()
    .nullable()
    .optional()
    .meta({
      description: '登录用户 ID；用户不存在或登录失败时可能为空',
      examples: ['1'],
    }),
  username: z
    .string()
    .nullable()
    .optional()
    .meta({
      description: '本次登录使用的用户账号，用于保留登录时的账号信息',
      examples: ['admin'],
    }),
  status: z.boolean().meta({
    description: '登录是否成功，true 表示成功，false 表示失败',
    examples: [true, false],
  }),
  failReason: z
    .string()
    .nullable()
    .optional()
    .meta({
      description: '登录失败原因；登录成功时通常为空',
      examples: ['密码错误', '账号已禁用'],
    }),
  ip: z
    .string()
    .nullable()
    .optional()
    .meta({
      description: '发起登录请求的客户端 IP 地址',
      examples: ['192.168.1.1'],
    }),

  ipLocation: z
    .string()
    .nullable()
    .optional()
    .meta({
      description: '客户端 IP 地址的归属地信息',
      examples: ['中国 江苏省 南京市'],
    }),

  browser: z
    .string()
    .nullable()
    .optional()
    .meta({
      description: '客户端浏览器名称及版本信息',
      examples: ['Chrome 153', 'Microsoft Edge 153'],
    }),

  os: z
    .string()
    .nullable()
    .optional()
    .meta({
      description: '客户端操作系统名称及版本信息',
      examples: ['Windows 11', 'macOS 26', 'Android 16'],
    }),

  device: z
    .string()
    .nullable()
    .optional()
    .meta({
      description: '客户端设备类型或设备型号',
      examples: ['Desktop', 'iPhone', 'iPad'],
    }),

  userAgent: z
    .string()
    .nullable()
    .optional()
    .meta({
      description: '客户端请求携带的原始 User-Agent 字符串',
      examples: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36',
      ],
    }),

  traceId: z
    .string()
    .nullable()
    .optional()
    .meta({
      description: '本次登录请求的链路追踪 ID，用于关联请求日志',
      examples: ['01JABCDEF1234567890XYZ'],
    }),

  payload: z
    .object({})
    .nullable()
    .optional()
    .meta({
      description: '登录事件的附加数据，仅保存必要的非敏感信息',
      examples: [{}],
    }),

  ...commonColumnsSchema,
}).meta({ id: 'SysLoginLog' })

export const sysLoginLogQuerySchema = baseQuerySchema
  .extend({
    ...sysLoginLogSchema.pick({
      loginType: true,
      platform: true,
    }).shape,
  })
  .meta({ id: 'sysLoginLogQuery' })

export const sysLoginLogCreateReqSchema = sysLoginLogSchema
  .pick({
    loginType: true,
    platform: true,
    userId: true,
    ip: true,
    ipLocation: true,
    browser: true,
    os: true,
    traceId: true,
    status: true,
    payload: true,
  })
  .meta({ id: 'sysLoginLogCreateReq' })

export type SysLoginLogQuery = z.infer<typeof sysLoginLogQuerySchema>
export type SysLoginLogCreateReq = z.infer<typeof sysLoginLogCreateReqSchema>
