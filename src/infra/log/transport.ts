import {
  ConsoleTransport,
  FileTransport,
  type Transport,
} from '@dunx/infra/logger'
import { devFormat } from './format'
import type { LogConfig } from '../config'

export const devTransport = (fileConfig: LogConfig['file']): Transport[] => [
  // 给了 format 就够了：pretty 只在没有 format 时决定用哪种内置格式
  new ConsoleTransport({ format: devFormat }),
  // 开发环境也落一份 JSON 文件：Promtail/Loki 才能采集到本地日志。
  new FileTransport({
    ...fileConfig,
  }),
]

export const prodTransport = (fileConfig: LogConfig['file']): Transport[] => [
  new ConsoleTransport({ pretty: false }),
  new FileTransport({
    ...fileConfig,
  }),
]
