/**
 * 任务状态
 */
export const PM_TASK_STATUS = {
  /**
   * 待办
   */
  TODO: 1,
  /**
   * 进行中
   */
  IN_PROGRESS: 2,
  /**
   * 已完成
   */
  DONE: 3,
  /**
   * 已取消
   */
  CANCELED: 4,
} as const

/**
 * 任务优先级
 */
export const PM_TASK_PRIORITY = {
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
  /**
   * 紧急
   */
  URGENT: 4,
} as const

/**
 * 任务动态动作
 */
export const PM_TASK_ACTIVITY_ACTION = {
  /**
   * 创建任务
   */
  CREATE: 'create',
  /**
   * 更新任务
   */
  UPDATE: 'update',
  /**
   * 变更状态
   */
  STATUS: 'status',
  /**
   * 变更负责人
   */
  ASSIGN: 'assign',
  /**
   * 新增评论
   */
  COMMENT: 'comment',
  /**
   * 新增附件
   */
  ATTACHMENT: 'attachment',
  /**
   * 删除任务
   */
  DELETE: 'delete',
} as const

export type TaskStatus = (typeof PM_TASK_STATUS)[keyof typeof PM_TASK_STATUS]
export type TaskPriority =
  (typeof PM_TASK_PRIORITY)[keyof typeof PM_TASK_PRIORITY]
export type TaskActivityAction =
  (typeof PM_TASK_ACTIVITY_ACTION)[keyof typeof PM_TASK_ACTIVITY_ACTION]
