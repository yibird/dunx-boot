import { createHash, randomUUID } from 'node:crypto'
import { mkdir, open, rename, rm } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import type { ReadableStreamDefaultReader } from 'node:stream/web'
import { Storage } from '@dunx/infra/files'
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  PayloadTooLargeError,
  ServerError,
} from '@/errors'
import { sessionContext } from '@/infra/context'
import { AppConfigService } from '@/infra/config'
import { FileCreateReq, type FileRecord, type FileUpload } from './schema'
import { downloadResponse } from './download'

type FileCreateInput = FileCreateReq

interface TransferMeta {
  version: 1
  id: string
  scope: [string | null, string]
  scopeHash: string
  name: string
  size: number
  contentType: string
  chunkSize: number
  chunkCount: number
  uploaded: number[]
  expiresAt: string
}

interface RecordMeta {
  version: 1
  id: string
  scope: [string | null, string]
  scopeHash: string
  name: string
  size: number
  contentType: string
  storageKey: string
}

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024
const DEFAULT_UPLOAD_TTL_SECONDS = 24 * 60 * 60
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * 文件上传服务。
 *
 * 分片先落到文件系统上的临时目录，再以流的方式交给 Storage。单进程
 * 用锁串行化同一上传的操作；元数据使用临时文件 + rename 持久化，进程
 * 重启后可继续上传。跨进程部署应在入口处提供单写者或外部锁。
 */
export class FileService {
  readonly #storage: Storage
  readonly #root: string
  readonly #chunkSize: number
  readonly #maxFileSize: number
  readonly #uploadTtlSeconds: number
  readonly #locks = new Map<string, Promise<void>>()

  constructor(storage: Storage, config: AppConfigService) {
    this.#storage = storage
    const values = config.values.files
    this.#root = isAbsolute(values.root)
      ? resolve(values.root)
      : resolve(process.cwd(), values.root)
    this.#chunkSize = values.chunkSize ?? DEFAULT_CHUNK_SIZE
    this.#maxFileSize = values.maxFileSize ?? DEFAULT_MAX_FILE_SIZE
    this.#uploadTtlSeconds =
      values.uploadTtlSeconds ?? DEFAULT_UPLOAD_TTL_SECONDS
  }

  async upload(
    input: FileCreateInput,
    body: ReadableStream<Uint8Array> | null
  ): Promise<FileRecord> {
    const parsed = this.#parseCreate(input)
    if (body === null && parsed.size !== 0) {
      throw new BadRequestError('请求体不能为空')
    }
    const upload = await this.createUpload(parsed)
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    try {
      reader = (body ?? bytesStream(new Uint8Array())).getReader()
      let pending: Uint8Array | undefined
      let pendingOffset = 0
      for (let index = 0; index < upload.chunkCount; index += 1) {
        const expected = expectedChunkLength(upload, index)
        const chunk = new Uint8Array(expected)
        let offset = 0
        while (offset < expected) {
          if (pending && pendingOffset < pending.byteLength) {
            const available = pending.byteLength - pendingOffset
            const take = Math.min(available, expected - offset)
            chunk.set(
              pending.subarray(pendingOffset, pendingOffset + take),
              offset
            )
            pendingOffset += take
            offset += take
            continue
          }
          pending = undefined
          pendingOffset = 0
          const next = await reader.read()
          if (next.done) throw new BadRequestError('上传内容长度不足')
          pending = asBytes(next.value)
        }
        await this.uploadChunk(upload.id, index, bytesStream(chunk))
      }
      const extra =
        pending && pendingOffset < pending.byteLength
          ? pending.subarray(pendingOffset)
          : undefined
      if (extra?.byteLength) {
        throw new PayloadTooLargeError('上传内容超过声明大小')
      }
      while (true) {
        const next = await reader.read()
        if (next.done) break
        if (next.value.byteLength > 0) {
          throw new PayloadTooLargeError('上传内容超过声明大小')
        }
      }
      return await this.completeUpload(upload.id)
    } catch (error) {
      try {
        await this.abortUpload(upload.id)
      } catch {
        // Keep the original upload error; cleanup is best effort.
      }
      throw error
    } finally {
      if (reader) {
        await reader.cancel().catch(() => undefined)
        reader.releaseLock()
      }
    }
  }

  async createUpload(input: FileCreateInput): Promise<FileUpload> {
    const parsed = this.#parseCreate(input)
    const session = sessionContext.require()
    const scope = [session.tenantId ?? null, session.userId] as [
      string | null,
      string,
    ]
    const scopeHash = hashScope(scope)
    const id = randomUUID()
    const chunkCount =
      parsed.size === 0 ? 0 : Math.ceil(parsed.size / this.#chunkSize)
    const expiresAt = new Date(
      Date.now() + this.#uploadTtlSeconds * 1000
    ).toISOString()
    const meta: TransferMeta = {
      version: 1,
      id,
      scope,
      scopeHash,
      name: parsed.name,
      size: parsed.size,
      contentType: parsed.contentType,
      chunkSize: this.#chunkSize,
      chunkCount,
      uploaded: [],
      expiresAt,
    }
    await mkdir(this.#transferDir(meta), { recursive: true })
    try {
      await this.#writeJsonAtomic(this.#transferMetaPath(meta), meta)
    } catch (error) {
      await this.#removeTransfer(meta)
      throw new ServerError('无法创建上传任务', undefined, error)
    }
    return toUpload(meta)
  }

  async getUpload(id: string): Promise<FileUpload> {
    this.#assertId(id)
    return this.#withLock(id, async () => {
      const meta = await this.#loadTransfer(id)
      if (!meta) throw new NotFoundError('上传任务不存在')
      if (isExpired(meta)) {
        await this.#removeTransfer(meta)
        throw new NotFoundError('上传任务已过期')
      }
      return toUpload(meta)
    })
  }

  async uploadChunk(
    id: string,
    index: number,
    body: ReadableStream<Uint8Array> | null
  ): Promise<FileUpload> {
    this.#assertId(id)
    if (!Number.isSafeInteger(index) || index < 0)
      throw new BadRequestError('分片序号无效')
    if (body === null) throw new BadRequestError('分片请求体不能为空')
    return this.#withLock(id, async () => {
      const meta = await this.#loadTransfer(id)
      if (!meta) {
        const record = await this.#loadRecord(id)
        if (record) throw new ConflictError('上传任务已完成')
        throw new NotFoundError('上传任务不存在')
      }
      if (isExpired(meta)) {
        await this.#removeTransfer(meta)
        throw new NotFoundError('上传任务已过期')
      }
      if (index >= meta.chunkCount)
        throw new BadRequestError('分片序号超出范围')
      const expected = expectedChunkLength(meta, index)
      const target = this.#chunkPath(meta, index)
      const temp = `${target}.${randomUUID()}.tmp`
      try {
        const length = await streamToFile(body, temp, expected)
        if (length !== expected) throw new BadRequestError('分片大小不正确')
        if (meta.uploaded.includes(index)) {
          const [oldHash, newHash] = await Promise.all([
            hashFile(target),
            hashFile(temp),
          ])
          if (oldHash !== newHash) throw new ConflictError('重复分片内容不一致')
          await rm(temp, { force: true })
          return toUpload(meta)
        }
        await replaceFile(temp, target)
        meta.uploaded = [...meta.uploaded, index].sort((a, b) => a - b)
        await this.#writeJsonAtomic(this.#transferMetaPath(meta), meta)
        return toUpload(meta)
      } catch (error) {
        await rm(temp, { force: true })
        throw error
      }
    })
  }

  async completeUpload(id: string): Promise<FileRecord> {
    this.#assertId(id)
    return this.#withLock(id, async () => {
      const existing = await this.#loadRecord(id)
      if (existing) return toRecord(existing)
      const meta = await this.#loadTransfer(id)
      if (!meta) throw new NotFoundError('上传任务不存在')
      if (isExpired(meta)) {
        await this.#removeTransfer(meta)
        throw new NotFoundError('上传任务已过期')
      }
      if (
        meta.uploaded.length !== meta.chunkCount ||
        meta.uploaded.some((value, i) => value !== i)
      ) {
        throw new ConflictError('仍有分片未上传')
      }
      const storageKey = `managed/${meta.scopeHash}/${meta.id}/content`
      const record: RecordMeta = {
        version: 1,
        id: meta.id,
        scope: meta.scope,
        scopeHash: meta.scopeHash,
        name: meta.name,
        size: meta.size,
        contentType: meta.contentType,
        storageKey,
      }
      try {
        const written = await this.#storage.write(
          storageKey,
          chunksStream(meta, this.#chunkPath.bind(this))
        )
        if (written !== meta.size) {
          await this.#storage.delete(storageKey).catch(() => undefined)
          throw new ServerError('存储写入长度不一致')
        }
        await mkdir(this.#recordDir(meta), { recursive: true })
        await this.#writeJsonAtomic(this.#recordPath(meta), record)
      } catch (error) {
        await this.#storage.delete(storageKey).catch(() => undefined)
        throw error
      }
      // 完成记录发布后，临时分片清理失败不能再回滚已提交的文件。
      await this.#removeTransfer(meta).catch(() => undefined)
      return toRecord(record)
    })
  }

  async abortUpload(id: string): Promise<void> {
    this.#assertId(id)
    await this.#withLock(id, async () => {
      const meta = await this.#loadTransfer(id)
      if (meta) {
        await this.#removeTransfer(meta)
        return
      }
      // Aborting an already completed upload is idempotent.
      if (await this.#loadRecord(id)) return
      throw new NotFoundError('上传任务不存在')
    })
  }

  async download(id: string, request: Request): Promise<Response> {
    this.#assertId(id)
    const record = await this.#loadRecord(id)
    if (!record) throw new NotFoundError('文件不存在')
    return downloadResponse(
      this.#storage,
      record.storageKey,
      toRecord(record),
      request
    )
  }

  #parseCreate(input: FileCreateInput): FileCreateInput {
    const result = FileCreateReq.safeParse(input)
    if (!result.success)
      throw new BadRequestError('文件参数无效', result.error.issues)
    if (!Number.isSafeInteger(result.data.size) || result.data.size < 0) {
      throw new BadRequestError('文件大小无效')
    }
    if (result.data.size > this.#maxFileSize)
      throw new PayloadTooLargeError('文件超过大小限制')
    return result.data
  }

  #assertId(id: string): void {
    if (typeof id !== 'string' || !UUID_PATTERN.test(id))
      throw new BadRequestError('文件 id 无效')
  }

  async #loadTransfer(id: string): Promise<TransferMeta | undefined> {
    const session = sessionContext.require()
    const scope = [session.tenantId ?? null, session.userId] as [
      string | null,
      string,
    ]
    const scopeHash = hashScope(scope)
    return readJson<TransferMeta>(
      join(this.#transfersRoot(), scopeHash, id, 'meta.json')
    )
  }

  async #loadRecord(id: string): Promise<RecordMeta | undefined> {
    const session = sessionContext.require()
    const scope = [session.tenantId ?? null, session.userId] as [
      string | null,
      string,
    ]
    const scopeHash = hashScope(scope)
    return readJson<RecordMeta>(
      join(this.#recordsRoot(), scopeHash, `${id}.json`)
    )
  }

  #transferDir(meta: Pick<TransferMeta, 'scopeHash' | 'id'>): string {
    return join(this.#transfersRoot(), meta.scopeHash, meta.id)
  }

  #transferMetaPath(meta: Pick<TransferMeta, 'scopeHash' | 'id'>): string {
    return join(this.#transferDir(meta), 'meta.json')
  }

  #chunkPath(
    meta: Pick<TransferMeta, 'scopeHash' | 'id'>,
    index: number
  ): string {
    return join(this.#transferDir(meta), `chunk-${index}.part`)
  }

  #recordDir(meta: Pick<TransferMeta, 'scopeHash'>): string {
    return join(this.#recordsRoot(), meta.scopeHash)
  }

  #recordPath(meta: Pick<TransferMeta, 'scopeHash' | 'id'>): string {
    return join(this.#recordDir(meta), `${meta.id}.json`)
  }

  #transfersRoot(): string {
    return join(this.#root, '.transfers')
  }

  #recordsRoot(): string {
    return join(this.#root, '.records')
  }

  async #removeTransfer(meta: TransferMeta): Promise<void> {
    await rm(this.#transferDir(meta), { recursive: true, force: true })
  }

  async #writeJsonAtomic(path: string, value: unknown): Promise<void> {
    await mkdir(resolve(path, '..'), { recursive: true })
    const temp = `${path}.${randomUUID()}.tmp`
    try {
      await Bun.write(temp, JSON.stringify(value))
      await replaceFile(temp, path)
    } finally {
      await rm(temp, { force: true }).catch(() => undefined)
    }
  }

  async #withLock<T>(id: string, fn: () => Promise<T>): Promise<T> {
    const previous = this.#locks.get(id) ?? Promise.resolve()
    let release!: () => void
    const current = new Promise<void>((resolveRelease) => {
      release = resolveRelease
    })
    this.#locks.set(id, current)
    await previous
    try {
      return await fn()
    } finally {
      release()
      if (this.#locks.get(id) === current) this.#locks.delete(id)
    }
  }
}

function hashScope(scope: [string | null, string]): string {
  return createHash('sha256').update(JSON.stringify(scope)).digest('hex')
}

function isExpired(meta: TransferMeta): boolean {
  return Date.parse(meta.expiresAt) <= Date.now()
}

function expectedChunkLength(
  meta: Pick<TransferMeta, 'size' | 'chunkSize' | 'chunkCount'> | FileUpload,
  index: number
): number {
  if (index < 0 || index >= meta.chunkCount) return 0
  return index === meta.chunkCount - 1
    ? meta.size - index * meta.chunkSize
    : meta.chunkSize
}

function toUpload(meta: TransferMeta): FileUpload {
  return {
    id: meta.id,
    name: meta.name,
    size: meta.size,
    contentType: meta.contentType,
    chunkSize: meta.chunkSize,
    chunkCount: meta.chunkCount,
    uploaded: [...meta.uploaded],
    expiresAt: meta.expiresAt,
  }
}

function toRecord(
  meta: Pick<RecordMeta, 'id' | 'name' | 'size' | 'contentType'>
): FileRecord {
  return {
    id: meta.id,
    name: meta.name,
    size: meta.size,
    contentType: meta.contentType,
  }
}

async function readJson<T>(path: string): Promise<T | undefined> {
  try {
    const text = await Bun.file(path).text()
    return JSON.parse(text) as T
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw new ServerError('无法读取文件元数据', undefined, error)
  }
}

async function replaceFile(temp: string, destination: string): Promise<void> {
  try {
    await rename(temp, destination)
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code !== 'EEXIST' && code !== 'EPERM' && code !== 'ENOTEMPTY')
      throw error
    await rm(destination, { force: true })
    await rename(temp, destination)
  }
}

async function streamToFile(
  body: ReadableStream<Uint8Array>,
  path: string,
  maxLength: number
): Promise<number> {
  const file = await open(path, 'wx')
  const reader = body.getReader()
  let length = 0
  try {
    while (true) {
      const next = await reader.read()
      if (next.done) break
      const bytes = asBytes(next.value)
      if (length + bytes.byteLength > maxLength)
        throw new PayloadTooLargeError('分片超过声明大小')
      let offset = 0
      while (offset < bytes.byteLength) {
        const result = await file.write(
          bytes,
          offset,
          bytes.byteLength - offset
        )
        offset += result.bytesWritten
      }
      length += bytes.byteLength
    }
  } finally {
    await reader.cancel().catch(() => undefined)
    reader.releaseLock()
    await file.close()
  }
  return length
}

async function hashFile(path: string): Promise<string> {
  const hash = createHash('sha256')
  const reader = Bun.file(path).stream().getReader()
  try {
    while (true) {
      const next = await reader.read()
      if (next.done) break
      hash.update(asBytes(next.value))
    }
  } finally {
    await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }
  return hash.digest('hex')
}

function chunksStream(
  meta: TransferMeta,
  chunkPath: (meta: TransferMeta, index: number) => string
): ReadableStream<Uint8Array> {
  let index = 0
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        if (reader) {
          const next = await reader.read()
          if (!next.done) {
            controller.enqueue(asBytes(next.value))
            return
          }
          reader.releaseLock()
          reader = undefined
          index += 1
        }
        if (index >= meta.chunkCount) {
          controller.close()
          return
        }
        reader = Bun.file(chunkPath(meta, index)).stream().getReader()
      }
    },
    async cancel() {
      await reader?.cancel().catch(() => undefined)
      reader?.releaseLock()
      reader = undefined
    },
  })
}

function bytesStream(bytes: Uint8Array): ReadableStream<Uint8Array> {
  let emitted = false
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (emitted) {
        controller.close()
      } else {
        emitted = true
        controller.enqueue(bytes)
      }
    },
  })
}

function asBytes(value: Uint8Array): Uint8Array {
  return value instanceof Uint8Array ? value : new Uint8Array(value)
}
