/**
 * 通知类型
 */
export const SYS_NOTICE_TYPE = {
  /**
   * 通知
   */
  Notice: 1,
  /**
   * 公告
   */
  Announcement: 2,
} as const

/**
 * 通知发送方式
 */
export const SYS_NOTICE_SEND_MODE = {
  /**
   * 立即发送
   */
  Immediate: 'immediate',
  /**
   * 定时发送
   */
  Scheduled: 'scheduled',
} as const

export type NoticeType = ValueOf<typeof SYS_NOTICE_TYPE>
export type NoticeSendMode = ValueOf<typeof SYS_NOTICE_SEND_MODE>
