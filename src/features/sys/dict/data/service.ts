import { CrudService } from '@/infra/crud'
import { SysDictDataRepository } from './repository'
import type { sysDictData } from '@/schemas'
import type { SysDictDataQuery } from './schema'

export class SysDictDataService extends CrudService<
  typeof sysDictData,
  never,
  SysDictDataRepository,
  SysDictDataQuery
> {
  constructor(repository: SysDictDataRepository) {
    super(repository)
  }
}
