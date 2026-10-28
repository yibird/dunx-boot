/**
 * 任务状态
 */
export const SYS_TASK_STATUS = {
  /**
   * 待执行
   */
  Pending: 1,
  /**
   * 执行中
   */
  Running: 2,
  /**
   * 执行成功
   */
  Success: 3,
  /**
   * 执行失败
   */
  Failed: 4,
  /**
   * 已取消
   */
  Canceled: 5,
} as const

// 可选：导出类型
export type SysTaskStatus = ValueOf<typeof SYS_TASK_STATUS>
