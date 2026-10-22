/**
 * 岗位级别
 */
export const SYS_POST_LEVEL = {
  // 实习
  INTERN: 1,
  // 初级
  JUNIOR: 2,
  // 中级
  INTERMEDIATE: 3,
  // 高级
  SENIOR: 4,
  // 专家
  EXPERT: 5,
  // 资深专家
  SENIOR_EXPERT: 6,
  // 首席
  PRINCIPAL: 6,
} as const

export type SysPOstLevel = ValueOf<typeof SYS_POST_LEVEL>
