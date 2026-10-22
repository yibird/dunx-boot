import type { BunRequest } from 'bun'
import type { Middleware, Next, RouteContext } from '@dunx/http'
import { ForbiddenError } from '@/errors'
import { sessionContext } from '@/infra/context'
import { matchesPermission, PERMISSIONS } from './permission'
import { AssertUtils } from '@/utils'
import { ApiStatus, ApiStatusMessage } from '@/constants'

/**
 * 「一个角色持有哪些权限码」的提供方。
 *
 * 守卫只认这个契约，不认识 `sys_menu`：应用侧把它绑到认证服务上（见
 * `SysAuthModule`），于是数据源换实现（令牌载荷、外部权限服务）或写测试时
 * 整块替换即可，守卫本身一行都不用动。
 */
export abstract class PermissionResolver {
  /**
   * 角色持有的权限码
   */
  abstract permissionCodes(roleId: string): Promise<readonly string[]>
}

/**
 * 权限守卫：按 {@link Permission} 声明的权限码校验当前账号。
 */
export class PermissionGuard implements Middleware {
  constructor(private readonly permissions: PermissionResolver) {}

  async handle(
    _req: BunRequest,
    ctx: RouteContext,
    next: Next
  ): Promise<Response> {
    const permission = ctx.get(PERMISSIONS)
    if (!permission?.length) return next()
    const permissions = sessionContext.get()?.permissions ?? []
    AssertUtils.isTrue(
      matchesPermission(permissions, permission),
      new ForbiddenError(ApiStatusMessage[ApiStatus.FORBIDDEN])
    )
    return next()
  }
}
