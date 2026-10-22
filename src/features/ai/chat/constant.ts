/** AI 消息角色。 */
export const AI_MESSAGE_ROLE = {
  SYSTEM: 'system',
  USER: 'user',
  ASSISTANT: 'assistant',
  TOOL: 'tool',
} as const

/** AI 消息角色值。 */
export type AiMessageRoleValue =
  (typeof AI_MESSAGE_ROLE)[keyof typeof AI_MESSAGE_ROLE]

/** AI 消息处理状态。 */
export const Ai_MESSAGE_STATUS = {
  PENDING: 'pending',
  STREAMING: 'streaming',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const

/** AI 消息处理状态值。 */
export type AiMessageStatusValue =
  (typeof Ai_MESSAGE_STATUS)[keyof typeof Ai_MESSAGE_STATUS]

export const POSTGRES_INTEGER_MAX = 2_147_483_647
