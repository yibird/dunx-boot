import { asc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { sysDept } from '@/schemas'
import type { SysDeptQuery } from './model'

/**
 * 部门仓储层
 */
export class SysDeptRepository extends CrudRepository<typeof sysDept> {
  constructor() {
    super({
      table: sysDept,
      cache: true,
      defaultOrderBy: [asc(sysDept.sort), asc(sysDept.createdAt)],
    })
  }

  override getQueryOptions(query: Partial<SysDeptQuery>) {
    return {
      where: mergeAnd(
        ilikeIf(sysDept.deptName, query.deptName),
        eqIf(sysDept.parentId, query.parentId)
      ),
    }
  }
}
