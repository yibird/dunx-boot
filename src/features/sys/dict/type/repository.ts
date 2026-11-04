import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { sysDictType } from '@/schemas'

/**
 * 字典类型仓储。
 */
export class SysDictTypeRepository extends CrudRepository<typeof sysDictType> {
  constructor() {
    super({
      table: sysDictType,
      queryOptions: {
        orderBy: [asc(sysDictType.id)],
      },
    })
  }
}
