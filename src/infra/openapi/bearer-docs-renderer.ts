import {
  SECURITY_SCHEME,
  bearerScheme,
  type OpenApiDocument,
  type OperationObject,
  type PageOptions,
  type PathItemObject,
  type SecurityRequirement,
} from '@dunx/openapi'
import { ScalarRenderer } from '@dunx/openapi/scalar'

const SECURITY: readonly SecurityRequirement[] = [{ [SECURITY_SCHEME]: [] }]

/**
 * 让文档页的认证面板对每个接口生效：token 填一次，后续请求自动带上。
 *
 * 框架只在有路由声明 `@Roles` 时才写 `securitySchemes`，本应用用的是
 * `@Permission`，文档里因此没有任何安全方案，Scalar 也就没有认证入口。
 * 这里补上 bearer 方案和文档级要求；`@Public()` 的路由带的是 `security: []`
 * （显式开放），不会被这层默认值锁上。`persistAuth` 让填过的 token 在刷新后保留。
 */
export class BearerDocsRenderer extends ScalarRenderer {
  constructor() {
    super({ persistAuth: true })
  }

  override page(document: OpenApiDocument, options: PageOptions) {
    return super.page(withBearerAuth(document), options)
  }
}

function withBearerAuth(document: OpenApiDocument): OpenApiDocument {
  const paths: Record<string, PathItemObject> = {}
  for (const [path, item] of Object.entries(document.paths)) {
    paths[path] = {
      ...(item.get ? { get: requireBearer(item.get) } : {}),
      ...(item.post ? { post: requireBearer(item.post) } : {}),
      ...(item.put ? { put: requireBearer(item.put) } : {}),
      ...(item.patch ? { patch: requireBearer(item.patch) } : {}),
      ...(item.delete ? { delete: requireBearer(item.delete) } : {}),
    }
  }
  return {
    ...document,
    paths,
    components: {
      ...document.components,
      securitySchemes: {
        ...document.components.securitySchemes,
        [SECURITY_SCHEME]: bearerScheme,
      },
    },
  }
}

function requireBearer(operation: OperationObject): OperationObject {
  return { ...operation, security: operation.security ?? SECURITY }
}
