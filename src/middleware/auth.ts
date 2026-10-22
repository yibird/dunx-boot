import {
  PUBLIC,
  UNMATCHED,
  type Middleware,
  type Next,
  type RouteContext,
} from '@dunx/http'
import picomatch from 'picomatch'
import { UnauthorizedError } from '@/errors'
import { AppConfigService } from '@/infra/config'
import { sessionContext } from '@/infra/context'
import { AssertUtils, TokenUtils, WebUtils } from '@/utils'

import type { BunRequest } from 'bun'

/**
 * 白名单匹配器：构造一次，之后每请求只做「一次路径解析 + 若干次比较」。
 *
 * 没有通配符的条目，picomatch 编译出来的就是精确匹配，等价于一次字符串相等，
 * 所以这些条目走 `Set` 短路，正则只留给真正的 glob —— 语义与逐条 picomatch 完全一致。
 */
export function createWhiteList(
  entries: readonly string[]
): (url: string) => boolean {
  const literals = new Set<string>()
  const globs: ReturnType<typeof picomatch>[] = []
  for (const entry of entries) {
    if (picomatch.scan(entry).isGlob === true) {
      globs.push(picomatch(entry, { dot: true }))
    } else {
      literals.add(entry)
    }
  }
  return (url) => {
    const pathname = new URL(url).pathname
    return literals.has(pathname) || globs.some((matcher) => matcher(pathname))
  }
}

/**
 * 全局认证中间件：公开路由及白名单之外始终校验访问令牌。
 */
export class AuthMiddleware implements Middleware {
  readonly #isWhiteListed: (pathname: string) => boolean

  constructor(private readonly config: AppConfigService) {
    const whiteList = config.values.security.auth.whiteList ?? []
    this.#isWhiteListed = createWhiteList(whiteList)
  }

  async handle(
    req: BunRequest,
    ctx: RouteContext,
    next: Next
  ): Promise<Response> {
    const isPublic = ctx.get(PUBLIC) === true && ctx.get(UNMATCHED) !== true
    if (isPublic || this.#isWhiteListed(req.url)) return next()
    const token = WebUtils.getToken(req)
    AssertUtils.notNull(token, new UnauthorizedError('未携带有效的访问令牌'))
    const payload = await TokenUtils.verifyAccess(token)
    return sessionContext.run(
      {
        userId: payload.sub,
        account: payload.account,
        tenantId: payload.tenantId,
        roleId: payload.roleId,
      },
      next
    )
  }
}
