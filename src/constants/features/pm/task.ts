/**
 * 任务状态
 */
export const PM_TASK_STATUS = {
  /**
   * 待办
   */
  Todo: 1,
  /**
   * 进行中
   */
  InProgress: 2,
  /**
   * 已完成
   */
  Done: 3,
  /**
   * 已取消
   */
  Canceled: 4,
} as const

/**
 * 任务优先级
 */
export const PM_TASK_PRIORITY = {
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
  /**
   * 紧急
   */
  Urgent: 4,
} as const

/**
 * 任务动态动作
 */
export const PM_TASK_ACTIVITY_ACTION = {
  /**
   * 创建任务
   */
  Create: 'create',
  /**
   * 更新任务
   */
  Update: 'update',
  /**
   * 变更状态
   */
  Status: 'status',
  /**
   * 变更负责人
   */
  Assign: 'assign',
  /**
   * 新增评论
   */
  Comment: 'comment',
  /**
   * 新增附件
   */
  Attachment: 'attachment',
  /**
   * 删除任务
   */
  Delete: 'delete',
} as const

export type PmTaskStatus = ValueOf<typeof PM_TASK_STATUS>
export type PmTaskPriority = ValueOf<typeof PM_TASK_PRIORITY>
export type PmTaskActivityAction = ValueOf<typeof PM_TASK_ACTIVITY_ACTION>
