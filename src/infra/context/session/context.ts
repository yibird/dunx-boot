import { UnauthorizedError } from '@/errors'
import { DEFAULT_TENANT_ID } from '@/constants'
import { createContext } from '../context'
import type { SessionContext } from './types'

/**
 * 请求级会话上下文。
 *
 * 放在基础设施层而不是认证特性里：它是「按请求存会话」的机制，
 * 会话守卫负责写入，仓储、审计、限流等基础设施都可能是读取方；
 * 放在特性里会逼着 `src/infra` 反向依赖 `src/features`。
 *
 * 会话守卫校验通过后用 {@link sessionContext}.run 绑定当前会话，
 * 后续 controller/service 用 `.get()` / `.require()` 读取；`require()`
 * 取不到会话时抛 401，走统一信封里的未认证分支。
 */
export const sessionContext = createContext<SessionContext>(
  'Session',
  () => new UnauthorizedError()
)

export function getTenantId() {
  return sessionContext.get()?.tenantId ?? DEFAULT_TENANT_ID
}
