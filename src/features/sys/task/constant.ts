/**
 * 任务状态
 */
export const SYS_TASK_STATUS = {
  /**
   * 待执行
   */
  PENDING: 1,
  /**
   * 执行中
   */
  RUNNING: 2,
  /**
   * 执行成功
   */
  SUCCESS: 3,
  /**
   * 执行失败
   */
  FAILED: 4,
  /**
   * 已取消
   */
  CANCELED: 5,
} as const

export type SysTaskStatus =
  (typeof SYS_TASK_STATUS)[keyof typeof SYS_TASK_STATUS]
