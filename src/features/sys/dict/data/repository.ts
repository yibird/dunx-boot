import { asc, desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { sysDictData } from '@/schemas'

export class SysDictDataRepository extends CrudRepository<typeof sysDictData> {
  constructor() {
    super({
      table: sysDictData,
      queryOptions: {
        orderBy: [asc(sysDictData.sort), desc(sysDictData.createBy)],
      },
    })
  }
}
