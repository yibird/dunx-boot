import { Pager } from '@/infra/model'
import { SysRequestLogRepository } from './repository'
import type { SysRequestLogInsert } from '@/schemas'
import type { SysRequestLogQuery } from './schema'

export class SysRequestLogService {
  constructor(readonly repository: SysRequestLogRepository) {}

  async create(value: SysRequestLogInsert) {
    return this.repository.create(value)
  }

  async getPageList(query: SysRequestLogQuery) {
    const { list, total } = await this.repository.getPageList(query)
    return Pager.of(list, total, query)
  }
}
