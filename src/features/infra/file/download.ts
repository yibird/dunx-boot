import { NotFoundError } from '@/errors'
import { FileNotFoundError, type Storage } from '@dunx/infra/files'
import { isSafeContentType, type FileRecord } from './schema'

type ByteRange = { start: number; end: number }

/**
 * 创建文件下载响应；读取通过 Storage.readStream，Range 只支持单段。
 */
export async function downloadResponse(
  storage: Storage,
  key: string,
  record: FileRecord,
  request: Request
): Promise<Response> {
  let stat
  try {
    stat = await storage.stat(key)
  } catch (error) {
    throwDownloadError(error)
  }
  const parsed = parseRange(request.headers.get('range'), stat.size)
  if (parsed === 'unsatisfiable') {
    return new Response(null, {
      status: 416,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes */${stat.size}`,
      },
    })
  }
  const partial = parsed !== undefined
  const start = parsed?.start ?? 0
  const end = parsed?.end ?? stat.size - 1
  const contentType = safeContentType(record.contentType, stat.type)
  const fileName = encodeFileName(record.name)
  const headers = new Headers({
    'Accept-Ranges': 'bytes',
    'Content-Type': contentType,
    'Content-Length': String(Math.max(end - start + 1, 0)),
    'Content-Disposition': `attachment; filename*=UTF-8''${fileName}`,
    'Last-Modified': stat.lastModified.toUTCString(),
    'Cache-Control': 'private, no-transform',
    'X-Content-Type-Options': 'nosniff',
  })
  if (partial)
    headers.set('Content-Range', `bytes ${start}-${end}/${stat.size}`)
  let stream: ReadableStream<Uint8Array> | undefined
  try {
    stream = await storage.readStream(key)
    if (partial) stream = sliceStream(stream, start, end - start + 1)
    return new Response(stream, { status: partial ? 206 : 200, headers })
  } catch (error) {
    // Response() can reject after the backend has opened a stream. Release it
    // before forwarding the original error to the framework.
    await stream?.cancel().catch(() => undefined)
    throwDownloadError(error)
  }
}

function throwDownloadError(error: unknown): never {
  // The package guarantees this literal name even when duplicate bundled
  // copies make instanceof fail across package subpaths.
  if (
    error instanceof FileNotFoundError ||
    (error instanceof Error && error.name === 'FileNotFoundError')
  )
    throw new NotFoundError('文件不存在')
  throw error
}

function safeContentType(recordType: unknown, storageType: unknown): string {
  if (typeof recordType === 'string' && isSafeContentType(recordType))
    return recordType
  if (typeof storageType === 'string' && isSafeContentType(storageType))
    return storageType
  return 'application/octet-stream'
}

function encodeFileName(value: unknown): string {
  const normalized = (
    typeof value === 'string' ? value : 'download'
  ).toWellFormed()
  return encodeURIComponent(normalized).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  )
}

function parseRange(
  value: string | null,
  size: number
): ByteRange | undefined | 'unsatisfiable' {
  if (!value) return undefined
  const match = /^bytes=(\d*)-(\d*)$/i.exec(value.trim())
  if (!match || (match[1] === '' && match[2] === '')) return 'unsatisfiable'
  const start = match[1] === '' ? undefined : Number(match[1])
  const requestedEnd = match[2] === '' ? undefined : Number(match[2])
  if (start === undefined) {
    const suffix = requestedEnd!
    if (!Number.isSafeInteger(suffix) || suffix <= 0 || size === 0)
      return 'unsatisfiable'
    return { start: Math.max(size - suffix, 0), end: size - 1 }
  }
  if (!Number.isSafeInteger(start) || start < 0 || start >= size)
    return 'unsatisfiable'
  const end =
    requestedEnd === undefined ? size - 1 : Math.min(requestedEnd, size - 1)
  if (!Number.isSafeInteger(end) || end < start) return 'unsatisfiable'
  return { start, end }
}

function sliceStream(
  source: ReadableStream<Uint8Array>,
  start: number,
  length: number
): ReadableStream<Uint8Array> {
  const reader = source.getReader()
  let position = 0
  let remaining = length
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (remaining > 0) {
        const result = await reader.read()
        if (result.done) {
          controller.close()
          return
        }
        const chunk = result.value
        const chunkEnd = position + chunk.byteLength
        if (chunkEnd <= start) {
          position = chunkEnd
          continue
        }
        const from = Math.max(start - position, 0)
        const count = Math.min(chunk.byteLength - from, remaining)
        controller.enqueue(chunk.slice(from, from + count))
        position = chunkEnd
        remaining -= count
        if (remaining === 0) {
          controller.close()
          await reader.cancel()
        }
        return
      }
      controller.close()
    },
    async cancel(reason) {
      await reader.cancel(reason)
    },
  })
}
