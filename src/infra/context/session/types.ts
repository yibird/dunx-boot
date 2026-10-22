/**
 * 通过认证后的当前会话主体（来自访问令牌）。
 */
export interface SessionContext {
  /**
   * 用户id
   */
  userId: string
  /**
   * 账号
   */
  account?: string | undefined
  /**
   * 角色id
   */
  roleId?: string | undefined | null
  /**
   * 租户id
   */
  tenantId?: string | undefined
  /**
   * 权限列表
   */
  permissions?: readonly string[] | undefined
}
