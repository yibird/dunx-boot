/** AI 模型的能力类型。 */
export const AiModelType = {
  CHAT: 'chat',
  EMBEDDING: 'embedding',
  RERANK: 'rerank',
} as const

/** AI 模型能力类型值。 */
export type AiModelTypeValue = (typeof AiModelType)[keyof typeof AiModelType]
