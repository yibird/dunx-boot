import { asc, eq, or } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { sysUser } from '@/schemas'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'

/**
 * 用户仓储层
 */
export class SysUserRepository extends CrudRepository<typeof sysUser> {
  constructor(readonly db: BunSQLDatabase) {
    super({
      table: sysUser,
      cache: true,
      defaultOrderBy: [asc(sysUser.sort), asc(sysUser.createdAt)],
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
      .select()
      .from(sysUser)
      .where(eq(sysUser.account, account))
      .limit(1)
    return row
  }

  async findByEmail(email: string) {
    const [row] = await this.db
      .select()
      .from(sysUser)
      .where(or(eq(sysUser.email, email), eq(sysUser.account, email)))
      .limit(1)
    return row
  }

  async findByPhone(phone: string) {
    const [row] = await this.db
      .select()
      .from(sysUser)
      .where(or(eq(sysUser.phone, phone), eq(sysUser.account, phone)))
      .limit(1)
    return row
  }
}
