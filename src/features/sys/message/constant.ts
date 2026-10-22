/**
 * 消息类型，对应字典 sys_notice_type
 */
export const SYS_MESSAGE_TYPE = {
  /**
   * 系统通知
   */
  SYSTEM_NOTICE: 1,
  /**
   * 待办事项
   */
  TODO: 2,
  /**
   * 告警消息
   */
  ALERT: 3,
} as const

/**
 * 消息级别
 */
export const SYS_MESSAGE_LEVEL = {
  /**
   * 普通
   */
  NORMAL: 1,
  /**
   * 重要
   */
  IMPORTANT: 2,
  /**
   * 紧急
   */
  URGENT: 3,
} as const

export type SysMessageType = ValueOf<typeof SYS_MESSAGE_TYPE>
export type SysMessageLevel = ValueOf<typeof SYS_MESSAGE_LEVEL>
