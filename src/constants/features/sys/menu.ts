/**
 * 菜单类型
 */
export const SYS_MENU_TYPE = {
  /**
   * 目录
   */
  Dir: 1,
  /**
   * 菜单
   */
  Menu: 2,
  /**
   * 子菜单 (按钮/隐藏路由)
   */
  ChildMenu: 3,
  /**
   * 权限 (按钮级权限)
   */
  Permission: 4,
} as const

export type SysMenuType = ValueOf<typeof SYS_MENU_TYPE>
