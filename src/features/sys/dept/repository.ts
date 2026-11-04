import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { sysDept } from '@/schemas'

/**
 * 部门仓储层
 */
export class SysDeptRepository extends CrudRepository<typeof sysDept> {
  constructor() {
    super({
      table: sysDept,
      queryOptions: {
        orderBy: [asc(sysDept.sort), asc(sysDept.createdAt)],
      },
    })
  }
}
