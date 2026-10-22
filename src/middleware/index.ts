import type { Ctor } from '@dunx/core'
import { DashboardMiddleware } from '@dunx/dashboard'
import { Compression, ThrottleGuard, type Middleware } from '@dunx/http'
import { AuthMiddleware } from './auth'
import { RequestLogMiddleware } from './request-log'

export { AuthMiddleware, createWhiteList } from './auth'
export { RequestLogMiddleware } from './request-log'

/**
 * 全局中间件，数组顺序即执行顺序（外层在前）。
 *
 * - `Compression` 放最外层，压缩所有响应，包括面板与错误响应；
 *   只 import `CompressionModule` 是不生效的，框架要求由应用挂到链上。
 * - `DashboardMiddleware` 必须排在会话守卫之前：面板路径不是已声明路由，
 *   需要它先短路，否则守卫会先返回 401，面板永远不可达。
 * - `AuthMiddleware` 写入请求主体；`PermissionGuard` 紧跟其后，读的就是它
 *   写下的主体——两者之间不能再插别的中间件。
 * - `RequestLogMiddleware` 排在会话守卫之后：它要读 `sessionContext` 里的
 *   租户才能把日志记到正确的租户名下；同时又排在限流之前，429 也留痕。
 * - `PermissionGuard` 排在限流之前：判定只看主体与（带缓存的）权限码，
 *   被拒绝的请求不必再进限流计数。
 * - `ThrottleGuard` 排在认证之后：限流主体要读得到当前登录用户。
 */
export const globalMiddleware: readonly Ctor<Middleware>[] = [
  Compression,
  DashboardMiddleware,
  AuthMiddleware,
  // PermissionGuard,
  RequestLogMiddleware,
  ThrottleGuard,
]
