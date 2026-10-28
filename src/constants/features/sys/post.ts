/**
 * 岗位级别
 */
export const SYS_POST_LEVEL = {
  // 实习
  Intern: 1,
  // 初级
  Junior: 2,
  // 中级
  Intermediate: 3,
  // 高级
  Senior: 4,
  // 专家
  Expert: 5,
  // 资深专家
  SeniorExpert: 6,
  // 首席
  Principal: 7,
} as const

export type SysPOstLevel = ValueOf<typeof SYS_POST_LEVEL>
