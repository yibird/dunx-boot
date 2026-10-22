/**
 * 用户性别
 */
export const SYS_USER_SEX = {
  // 男
  MALE: 1,
  // 女
  FEMALE: 2,
} as const

export type SysUserSex = ValueOf<typeof SYS_USER_SEX>
