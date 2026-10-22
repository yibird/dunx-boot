import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { ilikeIf, mergeAnd } from '@/infra/db'
import { sysDictType } from '@/schemas'
import type { SysDictTypeQuery } from './schema'

/**
 * 字典类型仓储。
 */
export class SysDictTypeRepository extends CrudRepository<typeof sysDictType> {
  constructor() {
    super({
      table: sysDictType,
      cache: true,
      defaultOrderBy: [asc(sysDictType.id)],
    })
  }

  override getQueryOptions(query: Partial<SysDictTypeQuery>) {
    return {
      where: mergeAnd(
        ilikeIf(sysDictType.dictName, query.dictName),
        ilikeIf(sysDictType.dictType, query.dictType)
      ),
    }
  }
}
