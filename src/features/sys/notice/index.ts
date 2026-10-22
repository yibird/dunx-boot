import { Module } from '@dunx/core'
import { SysNoticeController } from './controller'
import { SysNoticeReadRepository, SysNoticeRepository } from './repository'
import { SysNoticeService } from './service'

/**
 * 通知公告模块：CRUD 由基类生成，「标记已读」写在控制器子类上。
 * 已读表不单独建模块，其仓储与通知共用这一个模块。
 */
@Module({
  imports: [],
  controllers: [SysNoticeController],
  providers: [SysNoticeRepository, SysNoticeReadRepository, SysNoticeService],
})
export class SysNoticeModule {}
