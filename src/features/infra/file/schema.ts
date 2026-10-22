import { z } from 'zod'
import { apiOkSchema } from '@/infra/model'

const MIME_TOKEN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/

/**
 * 判断值是否可以安全地放入 Content-Type 响应头。
 */
export function isSafeContentType(value: string): boolean {
  if (value.length === 0 || value.length > 255 || !/^[\x20-\x7e]+$/.test(value))
    return false
  const parts = value.split(';')
  const mediaType = parts[0] ?? ''
  const parameters = parts.slice(1)
  const separator = mediaType.indexOf('/')
  if (separator <= 0 || separator === mediaType.length - 1) return false
  if (
    !MIME_TOKEN.test(mediaType.slice(0, separator)) ||
    !MIME_TOKEN.test(mediaType.slice(separator + 1))
  )
    return false
  for (const parameter of parameters) {
    const part = parameter.trim()
    const equals = part.indexOf('=')
    if (equals <= 0) return false
    if (!MIME_TOKEN.test(part.slice(0, equals).trim())) return false
    const parameterValue = part.slice(equals + 1).trim()
    if (
      parameterValue.length === 0 ||
      (parameterValue.startsWith('"') && parameterValue.endsWith('"')
        ? /[\r\n]/.test(parameterValue)
        : !MIME_TOKEN.test(parameterValue))
    )
      return false
  }
  return true
}

function isSafeFileName(value: string): boolean {
  if (!value.isWellFormed()) return false
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if ((code >= 0 && code <= 0x1f) || (code >= 0x7f && code <= 0x9f))
      return false
  }
  return true
}

/**
 * 文件创建参数；分片上传与单请求上传共用。
 */
export const FileCreateReq = z
  .object({
    name: z
      .string()
      .min(1)
      .max(255)
      .refine(isSafeFileName, '文件名含无效字符')
      .meta({ description: '文件名' }),
    size: z
      .number()
      .int()
      .nonnegative()
      .meta({ description: '文件大小（字节）' }),
    contentType: z
      .string()
      .min(1)
      .max(255)
      .refine(isSafeContentType, 'MIME 类型无效')
      .default('application/octet-stream')
      .meta({ description: 'MIME 类型' }),
  })
  .meta({ id: 'FileCreateReq' })
export type FileCreateReq = z.infer<typeof FileCreateReq>

/**
 * 已完成文件的基本信息。
 */
export interface FileRecord {
  readonly id: string
  readonly name: string
  readonly size: number
  readonly contentType: string
}

/**
 * 分片上传任务及已收到的分片序号。
 */
export interface FileUpload extends FileRecord {
  readonly chunkSize: number
  readonly chunkCount: number
  readonly uploaded: number[]
  readonly expiresAt: string
}

const fileRecordSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    size: z.number().int(),
    contentType: z.string(),
  })
  .meta({ id: 'FileRecord' })

export const FileRecordResp = apiOkSchema(fileRecordSchema, 'FileRecordResp')
export const FileUploadResp = apiOkSchema(
  fileRecordSchema.extend({
    chunkSize: z.number().int(),
    chunkCount: z.number().int(),
    uploaded: z.array(z.number().int()),
    expiresAt: z.string(),
  }),
  'FileUploadResp'
)
