import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import {
  appSchema,
  now,
  sysAuthToken,
  sysCaptchaLog,
  sysLoginLog,
  sysMenu,
  sysRoleMenu,
  sysUser,
} from '@/schemas'

export type SysUserRow = typeof sysUser.$inferSelect
export type SysCaptchaRow = typeof sysCaptchaLog.$inferSelect
export type SysAuthTokenRow = typeof sysAuthToken.$inferSelect

/**
 * 认证数据访问层：用户、验证码、会话令牌与登录日志。
 */
export class SysAuthRepository {
  constructor(private readonly db: BunSQLDatabase<typeof appSchema>) {}

  async findUserByAccount(account: string): Promise<SysUserRow | undefined> {
    const [row] = await this.db
      .select()
      .from(sysUser)
      .where(and(eq(sysUser.account, account), eq(sysUser.deleted, false)))
      .limit(1)
    return row
  }

  async findUserByPhone(phone: string): Promise<SysUserRow | undefined> {
    const [row] = await this.db
      .select()
      .from(sysUser)
      .where(and(eq(sysUser.phone, phone), eq(sysUser.deleted, false)))
      .limit(1)
    return row
  }

  async findUserById(id: string): Promise<SysUserRow | undefined> {
    const [row] = await this.db
      .select()
      .from(sysUser)
      .where(and(eq(sysUser.id, id), eq(sysUser.deleted, false)))
      .limit(1)
    return row
  }

  async createUser(values: typeof sysUser.$inferInsert): Promise<SysUserRow> {
    const [row] = await this.db.insert(sysUser).values(values).returning()
    if (!row) throw new Error('创建用户失败')
    return row
  }

  async findCaptcha(captchaId: string): Promise<SysCaptchaRow | undefined> {
    const [row] = await this.db
      .select()
      .from(sysCaptchaLog)
      .where(
        and(
          eq(sysCaptchaLog.captchaId, captchaId),
          eq(sysCaptchaLog.deleted, false)
        )
      )
      .limit(1)
    return row
  }

  async updateCaptcha(
    captchaId: string,
    values: Partial<typeof sysCaptchaLog.$inferInsert>
  ): Promise<void> {
    await this.db
      .update(sysCaptchaLog)
      .set(values)
      .where(
        and(
          eq(sysCaptchaLog.captchaId, captchaId),
          eq(sysCaptchaLog.deleted, false)
        )
      )
  }

  async createAuthToken(
    values: typeof sysAuthToken.$inferInsert
  ): Promise<void> {
    await this.db.insert(sysAuthToken).values(values)
  }

  async findAuthToken(jti: string): Promise<SysAuthTokenRow | undefined> {
    const [row] = await this.db
      .select()
      .from(sysAuthToken)
      .where(and(eq(sysAuthToken.jti, jti), eq(sysAuthToken.deleted, false)))
      .limit(1)
    return row
  }

  async revokeAuthToken(userId: string, jti: string): Promise<void> {
    await this.db
      .update(sysAuthToken)
      .set({ revokedAt: now() })
      .where(
        and(
          eq(sysAuthToken.userId, userId),
          eq(sysAuthToken.jti, jti),
          isNull(sysAuthToken.revokedAt)
        )
      )
  }

  async revokeUserAuthTokens(userId: string): Promise<void> {
    await this.db
      .update(sysAuthToken)
      .set({ revokedAt: now() })
      .where(
        and(eq(sysAuthToken.userId, userId), isNull(sysAuthToken.revokedAt))
      )
  }

  async createLoginLog(values: typeof sysLoginLog.$inferInsert): Promise<void> {
    await this.db.insert(sysLoginLog).values(values)
  }

  /**
   * 角色持有的权限码：`sys_role_menu` 关联 `sys_menu.permission`，去重。
   *
   * 只出一串码，不带菜单树——守卫要的就是"能不能访问"，菜单结构是前端的事。
   */
  async findPermissionCodes(roleId: string): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ permission: sysMenu.permission })
      .from(sysRoleMenu)
      .innerJoin(sysMenu, eq(sysMenu.id, sysRoleMenu.menuId))
      .where(
        and(
          eq(sysRoleMenu.roleId, roleId),
          eq(sysRoleMenu.deleted, false),
          eq(sysMenu.deleted, false),
          isNotNull(sysMenu.permission)
        )
      )
    return rows
      .map((row) => row.permission?.trim())
      .filter((code): code is string => code !== undefined && code.length > 0)
  }
}
