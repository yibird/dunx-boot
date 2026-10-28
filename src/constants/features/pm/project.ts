/**
 * 项目状态
 */
export const PM_PROJECT_STATUS = {
  /**
   * 未开始
   */
  NotStarted: 1,
  /**
   * 进行中
   */
  InProgress: 2,
  /**
   * 已完成
   */
  Completed: 3,
  /**
   * 已归档
   */
  Archived: 4,
  /**
   * 已取消
   */
  Canceled: 5,
} as const

/**
 * 项目优先级
 */
export const PM_PROJECT_PRIORITY = {
  /**
   * 低
   */
  Low: 1,
  /**
   * 中
   */
  Medium: 2,
  /**
   * 高
   */
  High: 3,
} as const

/**
 * 项目成员角色
 */
export const PM_PROJECT_MEMBER_ROLE = {
  /**
   * 负责人
   */
  Owner: 1,
  /**
   * 管理员
   */
  Admin: 2,
  /**
   * 普通成员
   */
  Member: 3,
  /**
   * 观察者（只读）
   */
  Viewer: 4,
} as const

export type PmProjectStatus = ValueOf<typeof PM_PROJECT_STATUS>
export type PmProjectPriority = ValueOf<typeof PM_PROJECT_PRIORITY>
export type PmProjectMemberRole = ValueOf<typeof PM_PROJECT_MEMBER_ROLE>
