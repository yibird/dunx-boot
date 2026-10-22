/**
 * 工作流状态
 */
export const AiWorkflowStatus = {
  /** 草稿，尚未发布 */
  DRAFT: 'draft',
  /** 已发布 */
  PUBLISHED: 'published',
  /** 已归档 */
  ARCHIVED: 'archived',
  /** 已停用 */
  DISABLED: 'disabled',
} as const

/**
 * 工作流可见性
 */
export const AiWorkflowVisibility = {
  /** 仅所有者可用 */
  PRIVATE: 'private',
  /** 租户内公开 */
  PUBLIC: 'public',
} as const

/**
 * 工作流版本状态
 */
export const AiWorkflowVersionStatus = {
  /** 草稿版本 */
  DRAFT: 'draft',
  /** 已发布版本 */
  PUBLISHED: 'published',
  /** 已归档版本 */
  ARCHIVED: 'archived',
} as const

/**
 * 工作流触发方式
 */
export const AiWorkflowTriggerType = {
  /** 手动触发 */
  MANUAL: 'manual',
  /** 通过 API 触发 */
  API: 'api',
  /** 定时触发 */
  SCHEDULE: 'schedule',
  /** Webhook 触发 */
  WEBHOOK: 'webhook',
  /** 事件触发 */
  EVENT: 'event',
} as const

/**
 * 工作流运行状态
 */
export const AiWorkflowRunStatus = {
  /** 等待执行 */
  PENDING: 'pending',
  /** 执行中 */
  RUNNING: 'running',
  /** 执行成功 */
  SUCCESS: 'success',
  /** 执行失败 */
  FAILED: 'failed',
  /** 已取消 */
  CANCELED: 'canceled',
  /** 执行超时 */
  TIMEOUT: 'timeout',
} as const

/**
 * 节点运行状态
 */
export const AiWorkflowNodeRunStatus = {
  /** 等待执行 */
  PENDING: 'pending',
  /** 执行中 */
  RUNNING: 'running',
  /** 执行成功 */
  SUCCESS: 'success',
  /** 执行失败 */
  FAILED: 'failed',
  /** 因分支条件跳过 */
  SKIPPED: 'skipped',
  /** 已取消 */
  CANCELED: 'canceled',
} as const

/**
 * 节点类型
 */
export const AiWorkflowNodeType = {
  /** 开始节点 */
  START: 'start',
  /** 结束节点 */
  END: 'end',
  /** 大模型节点 */
  LLM: 'llm',
  /** 代码节点 */
  CODE: 'code',
  /** HTTP 请求节点 */
  HTTP: 'http',
  /** 条件分支节点 */
  CONDITION: 'condition',
  /** 循环节点 */
  LOOP: 'loop',
  /** 工具调用节点 */
  TOOL: 'tool',
  /** 知识库检索节点 */
  KNOWLEDGE: 'knowledge',
  /** 子工作流节点 */
  SUB_WORKFLOW: 'sub_workflow',
} as const

/**
 * 连线类型
 */
export const AiWorkflowEdgeType = {
  /** 普通连线 */
  DEFAULT: 'default',
  /** 条件连线 */
  CONDITION: 'condition',
  /** 异常连线 */
  ERROR: 'error',
} as const

/**
 * 运行日志级别
 */
export const AiWorkflowLogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const

/**
 * 工作流 API 状态
 */
export const AiWorkflowApiStatus = {
  /** 启用 */
  ACTIVE: 'active',
  /** 停用 */
  DISABLED: 'disabled',
} as const

/**
 * 工作流 API 鉴权方式
 */
export const AiWorkflowApiAuthType = {
  /** 不需要鉴权 */
  NONE: 'none',
  /** API Key 鉴权 */
  API_KEY: 'api_key',
  /** JWT 鉴权 */
  JWT: 'jwt',
} as const

/**
 * 工作流 API Key 状态
 */
export const AiWorkflowApiKeyStatus = {
  /** 可用 */
  ACTIVE: 'active',
  /** 已停用 */
  DISABLED: 'disabled',
  /** 已吊销 */
  REVOKED: 'revoked',
} as const

/**
 * 凭据类型
 */
export const AiWorkflowCredentialType = {
  /** API Key */
  API_KEY: 'api_key',
  /** OAuth2 */
  OAUTH2: 'oauth2',
  /** 用户名密码 */
  BASIC: 'basic',
  /** 数据库连接 */
  DATABASE: 'database',
  /** 自定义 */
  CUSTOM: 'custom',
} as const

/**
 * 凭据作用域
 */
export const AiWorkflowCredentialScope = {
  /** 仅所有者可用 */
  PRIVATE: 'private',
  /** 租户内共享 */
  TENANT: 'tenant',
  /** 租户内公开 */
  PUBLIC: 'public',
} as const

/**
 * 凭据状态
 */
export const AiWorkflowCredentialStatus = {
  /** 可用 */
  ACTIVE: 'active',
  /** 已停用 */
  DISABLED: 'disabled',
  /** 已过期 */
  EXPIRED: 'expired',
} as const

export type AiWorkflowStatusValue =
  (typeof AiWorkflowStatus)[keyof typeof AiWorkflowStatus]
export type AiWorkflowVisibilityValue =
  (typeof AiWorkflowVisibility)[keyof typeof AiWorkflowVisibility]
export type AiWorkflowVersionStatusValue =
  (typeof AiWorkflowVersionStatus)[keyof typeof AiWorkflowVersionStatus]
export type AiWorkflowTriggerTypeValue =
  (typeof AiWorkflowTriggerType)[keyof typeof AiWorkflowTriggerType]
export type AiWorkflowRunStatusValue =
  (typeof AiWorkflowRunStatus)[keyof typeof AiWorkflowRunStatus]
export type AiWorkflowNodeRunStatusValue =
  (typeof AiWorkflowNodeRunStatus)[keyof typeof AiWorkflowNodeRunStatus]
export type AiWorkflowNodeTypeValue =
  (typeof AiWorkflowNodeType)[keyof typeof AiWorkflowNodeType]
export type AiWorkflowEdgeTypeValue =
  (typeof AiWorkflowEdgeType)[keyof typeof AiWorkflowEdgeType]
export type AiWorkflowLogLevelValue =
  (typeof AiWorkflowLogLevel)[keyof typeof AiWorkflowLogLevel]
export type AiWorkflowApiStatusValue =
  (typeof AiWorkflowApiStatus)[keyof typeof AiWorkflowApiStatus]
export type AiWorkflowApiAuthTypeValue =
  (typeof AiWorkflowApiAuthType)[keyof typeof AiWorkflowApiAuthType]
export type AiWorkflowApiKeyStatusValue =
  (typeof AiWorkflowApiKeyStatus)[keyof typeof AiWorkflowApiKeyStatus]
export type AiWorkflowCredentialTypeValue =
  (typeof AiWorkflowCredentialType)[keyof typeof AiWorkflowCredentialType]
export type AiWorkflowCredentialScopeValue =
  (typeof AiWorkflowCredentialScope)[keyof typeof AiWorkflowCredentialScope]
export type AiWorkflowCredentialStatusValue =
  (typeof AiWorkflowCredentialStatus)[keyof typeof AiWorkflowCredentialStatus]
