/**
 * 默认租户 id。
 *
 * 没有会话的写入口（注册、种子、定时任务、审计日志）与
 * `tenant_id` 列默认值都落到这个租户。
 */
export const DEFAULT_TENANT_ID = '1'
