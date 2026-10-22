import { describe, expect, test } from 'bun:test'
import picomatch from 'picomatch'
import { createWhiteList } from '@/middleware/auth'
import baseConfig from '../config/application'

/**
 * 免令牌路径必须覆盖认证域：登录、注册、验证码、扫码在没有访问令牌时也要能用，
 * 它们是拿令牌的入口。其余接口一律留在会话守卫后面。
 */
const whiteList = (baseConfig.security?.auth?.whiteList ?? []).filter(
  (entry): entry is string => typeof entry === 'string'
)
const isWhitelisted = createWhiteList(whiteList)
const url = (path: string) => `http://localhost:3000${path}`

describe('auth whitelist', () => {
  test('lets the auth endpoints and the document through without a token', () => {
    for (const path of [
      '/api/auth/devLogin',
      '/api/auth/login',
      '/api/auth/login/phone',
      '/api/auth/captcha/image',
      '/api/auth/captcha/sms',
      '/api/auth/register/account',
      '/api/docs',
      '/api/openapi.json',
    ]) {
      expect(isWhitelisted(url(path)), path).toBe(true)
    }
  })

  test('keeps everything else behind the session guard', () => {
    for (const path of [
      '/api/ai/chat/send',
      '/api/ai/chat/getSessionList',
      '/api/sys/user/getList',
      // 前缀相近但不该被放行
      '/api/authorize',
    ]) {
      expect(isWhitelisted(url(path)), path).toBe(false)
    }
  })

  /**
   * 字面量走 Set、glob 走正则之后，结果必须与逐条 picomatch 完全一致：
   * 这是「只优化实现、不改语义」的唯一凭据。
   */
  test('agrees with plain picomatch on every path', () => {
    const matchers = whiteList.map((entry) => picomatch(entry, { dot: true }))
    const reference = (path: string) =>
      matchers.some((matcher) => matcher(path))
    for (const path of [
      '/api/docs',
      '/api/docs/standalone.js',
      '/api/docs/index.css',
      '/api/docs/',
      '/api/openapi.json',
      '/api/openapi.json/',
      '/api/auth',
      '/api/auth/',
      '/api/auth/devLogin',
      '/api/auth/captcha/image',
      '/api/authorize',
      '/api/ai/chat/send',
      '/',
      '/api',
    ]) {
      expect(isWhitelisted(url(path)), path).toBe(reference(path))
    }
  })
})
