import { describe, expect, test } from 'bun:test'
import type { OpenApiDocument } from '@dunx/openapi'
import { BearerDocsRenderer } from '@/infra/openapi/bearer-docs-renderer'
import { WebUtils } from '@/utils/web'

/**
 * 文档页要把 bearer 方案和"每个接口都要求认证"渲染进去，
 * Scalar 才会给出认证面板并在后续请求里自动带上 token。
 */
function document(): OpenApiDocument {
  return {
    openapi: '3.1.0',
    info: { title: 'Test', version: '1.0.0' },
    tags: [],
    paths: {
      '/api/demo': {
        get: {
          operationId: 'getDemo',
          responses: { '200': { description: 'OK' } },
        },
        post: {
          operationId: 'postDemo',
          responses: { '200': { description: 'OK' } },
          // @Public() 的路由由框架标成显式开放，不能被默认值锁上。
          security: [],
        },
      },
    },
    components: { schemas: {} },
  }
}

describe('openapi docs renderer', () => {
  test('renders the bearer scheme, requires it per operation and persists the token', async () => {
    const html = await new BearerDocsRenderer().page(document(), {
      jsonHref: '/api/openapi.json',
      warnings: [],
      mountedAt: '/api/docs',
    })

    expect(html).toContain('securitySchemes')
    expect(html).toContain('"scheme":"bearer"')
    // 开放路由保持显式开放，其余接口继承 bearer 要求。
    expect(html).toContain('"operationId":"postDemo"')
    expect(html).toContain('"security":[{"bearer":[]}]')
    expect(html).toContain('persistAuth')
  })

  test('accepts the Bearer prefix the docs page sends on try-it-out requests', () => {
    const request = (authorization?: string) =>
      new Request('http://localhost/api/ai/chat/getSessionList', {
        headers: authorization ? { authorization } : {},
      })

    expect(WebUtils.getToken(request('Bearer raw.jwt.value'))).toBe(
      'raw.jwt.value'
    )
    // 不带前缀的写法同样接受（curl / 脚本常用）。
    expect(WebUtils.getToken(request('raw.jwt.value'))).toBe('raw.jwt.value')
    expect(WebUtils.getToken(request())).toBeNull()
  })
})
