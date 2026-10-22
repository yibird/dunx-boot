import { Api, Pager } from '@/infra/model'
import { AiAgentRepository } from './repository'
import type { AiAgentCreateReq, AiAgentQuery, AiAgentUpdateReq } from './schema'

export class AiAgentService {
  constructor(private readonly repository: AiAgentRepository) {}

  async getRecord(id: string) {
    return Api.ok(await this.repository.getRecord(id))
  }

  async getList(query: AiAgentQuery) {
    return Api.ok(await this.repository.getList(query))
  }

  async getPageList(query: AiAgentQuery) {
    const { list, total } = await this.repository.getPageList(query)
    return Api.ok(Pager.of(list, total, query))
  }

  async create(input: AiAgentCreateReq) {
    return Api.ok(await this.repository.create(input))
  }

  async update(id: string, input: AiAgentUpdateReq) {
    return Api.ok(await this.repository.update(id, input))
  }

  async delete(id: string) {
    return Api.ok(await this.repository.delete(id))
  }
}
