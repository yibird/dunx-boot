import { isAbsolute, resolve } from 'node:path'
import type { DynamicModule } from '@dunx/core'
import { FilesModule, LocalStorageOptions } from '@dunx/infra/files'
import { AppConfigService } from '../config'

/**
 * 文件存储（本地磁盘后端）：全局发布 `Storage` / `StorageOptions`。
 *
 * `files.root` 支持相对路径，按进程工作目录解析；换成 S3 只需替换这里的
 * `LocalStorageOptions`，`Storage` 契约不变。
 */
export const AppFilesModule: DynamicModule = {
  ...FilesModule.forRootAsync({
    useFactory: (config: AppConfigService) => {
      const root = config.values.files.root
      return new LocalStorageOptions(
        isAbsolute(root) ? root : resolve(process.cwd(), root),
        true
      )
    },
    inject: [AppConfigService] as const,
  }),
  global: true,
}
