import { Pager } from '@/infra/model'
import { SysLoginLogRepository } from './repository'
import type { SysLoginLogInsert } from '@/schemas'
import type { SysLoginLogQuery } from './schema'

export class SysLoginLogService {
  constructor(readonly repository: SysLoginLogRepository) {}

  async create(value: SysLoginLogInsert) {
    return this.repository.create(value)
  }

  async getPageList(query: SysLoginLogQuery) {
    const { list, total } = await this.repository.getPageList(query)
    return Pager.of(list, total, query)
  }
}
