import { and, asc, eq, or } from 'drizzle-orm'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { CrudRepository } from '@/infra/crud'
import { sysUser } from '@/schemas'
import { eqIf } from '@/infra/db'

/**
 * 用户仓储层
 */
export class SysUserRepository extends CrudRepository<
  typeof sysUser,
  'password'
> {
  constructor(override readonly db: BunSQLDatabase) {
    super({
      table: sysUser,
      queryOptions: {
        where: and(eqIf(sysUser.dataStatus, 1)),
        orderBy: [asc(sysUser.sort), asc(sysUser.createdAt)],
      },
      ignoreColumns: ['password'],
    })
  }

  /**
   * 根据账号查询用户(账号可能是账号、手机号、邮箱)
   *
   * @param account 账号
   * @returns 用户实体或 undefined
   */
  async findByAccount(account: string) {
    const [row] = await this.db
      .select(this.selectColumns)
      .from(sysUser)
      .where(eq(sysUser.account, account))
      .limit(1)
    return row
  }

  async findByEmail(email: string) {
    const [row] = await this.db
      .select(this.selectColumns)
      .from(sysUser)
      .where(or(eq(sysUser.email, email), eq(sysUser.account, email)))
      .limit(1)
    return row
  }

  async findByPhone(phone: string) {
    const [row] = await this.db
      .select(this.selectColumns)
      .from(sysUser)
      .where(or(eq(sysUser.phone, phone), eq(sysUser.account, phone)))
      .limit(1)
    return row
  }
}
