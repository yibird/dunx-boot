/**
 * 用户性别
 */
export const SYS_USER_SEX = {
  // 男
  Male: 1,
  // 女
  Female: 2,
} as const

export type SysUserSex = ValueOf<typeof SYS_USER_SEX>
