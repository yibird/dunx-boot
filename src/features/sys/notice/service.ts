import { CrudService } from '@/infra/crud'
import { sessionContext } from '@/infra/context'
import { Api } from '@/infra/model'
import { NotFoundError } from '@/errors'
import { sysNotice } from '@/schemas'
import { SysNoticeReadRepository, SysNoticeRepository } from './repository'

/**
 * 通知公告业务层
 */
export class SysNoticeService extends CrudService<
  typeof sysNotice,
  SysNoticeRepository
> {
  constructor(
    override readonly repository: SysNoticeRepository,
    private readonly readRepository: SysNoticeReadRepository
  ) {
    super(repository)
  }

  /**
   * 发布人取当前会话，不接受客户端传入
   */
  override async create(input: Partial<typeof sysNotice.$inferInsert>) {
    const session = sessionContext.get()
    return super.create({
      ...input,
      publisherId: session?.userId,
      publisherName: session?.account,
    })
  }

  /**
   * 标记当前用户已读
   *
   * 幂等：已有已读记录时直接返回，不重复写入（唯一索引是最后一道防线）。
   * 通知不存在时抛 404，避免落下一行指向不存在通知的已读记录。
   */
  async read(id: string) {
    const { userId } = sessionContext.require()
    const notice = await this.repository.findById(id)
    if (!notice) throw new NotFoundError('通知不存在或已被删除')

    const existing = await this.readRepository.findRead(id, userId)
    if (existing) return Api.ok(existing)

    const row = await this.readRepository.create({ noticeId: id, userId })
    return Api.ok(row)
  }
}
