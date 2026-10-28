/**
 * 消息类型，对应字典 sys_notice_type
 */
export const SYS_MESSAGE_TYPE = {
  /**
   * 系统通知
   */
  SystemNotice: 1,
  /**
   * 待办事项
   */
  Todo: 2,
  /**
   * 告警消息
   */
  Alert: 3,
} as const

/**
 * 消息级别
 */
export const SYS_MESSAGE_LEVEL = {
  /**
   * 普通
   */
  Normal: 1,
  /**
   * 重要
   */
  Important: 2,
  /**
   * 紧急
   */
  Urgent: 3,
} as const

export type SysMessageType = ValueOf<typeof SYS_MESSAGE_TYPE>
export type SysMessageLevel = ValueOf<typeof SYS_MESSAGE_LEVEL>
