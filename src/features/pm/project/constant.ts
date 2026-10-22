/**
 * 项目状态
 */
export const PM_PROJECT_STATUS = {
  /**
   * 未开始
   */
  NOT_STARTED: 1,
  /**
   * 进行中
   */
  IN_PROGRESS: 2,
  /**
   * 已完成
   */
  COMPLETED: 3,
  /**
   * 已归档
   */
  ARCHIVED: 4,
  /**
   * 已取消
   */
  CANCELED: 5,
} as const

/**
 * 项目优先级
 */
export const PM_PROJECT_PRIORITY = {
  /**
   * 低
   */
  LOW: 1,
  /**
   * 中
   */
  MEDIUM: 2,
  /**
   * 高
   */
  HIGH: 3,
} as const

/**
 * 项目成员角色
 */
export const PM_PROJECT_MEMBER_ROLE = {
  /**
   * 负责人
   */
  OWNER: 1,
  /**
   * 管理员
   */
  ADMIN: 2,
  /**
   * 普通成员
   */
  MEMBER: 3,
  /**
   * 观察者（只读）
   */
  VIEWER: 4,
} as const

export type ProjectStatus =
  (typeof PM_PROJECT_STATUS)[keyof typeof PM_PROJECT_STATUS]
export type ProjectPriority =
  (typeof PM_PROJECT_PRIORITY)[keyof typeof PM_PROJECT_PRIORITY]
export type ProjectMemberRole =
  (typeof PM_PROJECT_MEMBER_ROLE)[keyof typeof PM_PROJECT_MEMBER_ROLE]
