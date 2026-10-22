import { Controller } from '@dunx/http'
import { ApiDoc } from '@dunx/openapi'
import { FileService } from './service'

/**
 * 文件接口：单请求上传、分片上传、进度查询、取消和支持 Range 的流式下载。
 */
@ApiDoc({ tags: ['文件'] })
@Controller('/files')
export class FileController {
  constructor(private readonly files: FileService) {}
}
