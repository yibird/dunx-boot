import { Module } from '@dunx/core'
import { FileService } from './service'

/**
 * 文件业务模块：依赖 infra 提供的 Storage，承载文件上传与下载 API。
 */
@Module({
  controllers: [],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
