import { Pager } from '@/infra/model'
import { SysCaptchaLogRepository } from './repository'
import type { SysCaptchaLog } from '@/schemas'
import type { SysCaptchaLogQuery } from './model'

export class SysCaptchaLogService {
  constructor(readonly repository: SysCaptchaLogRepository) {}

  async create(value: SysCaptchaLog) {
    return this.repository.create(value)
  }

  async getPageList(query: SysCaptchaLogQuery) {
    const { list, total } = await this.repository.getPageList(query)
    return Pager.of(list, total, query)
  }
}
