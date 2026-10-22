/**
 * 菜单类型
 */
export const SYS_MENU_TYPE = {
  /**
   * 目录
   */
  DIR: 1,
  /**
   * 菜单
   */
  MENU: 2,
  /**
   * 子菜单
   */
  CHILD_MENU: 3,
  /**
   * 权限
   */
  PERMISSION: 4,
} as const

export type SysMenuType = ValueOf<typeof SYS_MENU_TYPE>
