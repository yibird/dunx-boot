/** 提示词类型 */
export const AI_PROMPT_TYPE = {
  SYSTEM: 'system',
  USER: 'user',
} as const

/** 提示词类型 */
export type AiPromptTypeValue =
  (typeof AI_PROMPT_TYPE)[keyof typeof AI_PROMPT_TYPE]
