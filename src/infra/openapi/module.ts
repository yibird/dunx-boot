import { OpenApiModule, type OpenApiInfo } from '@dunx/openapi'
import { AppConfigService } from '../config'
import { BearerDocsRenderer } from './bearer-docs-renderer'
import type { ModuleRef } from '@dunx/core'

/**
 * OpenAPI/Scalar 文档模块
 */
export const createOpenApiModule = (rootModule: ModuleRef) =>
  OpenApiModule.forRootAsync({
    useFactory(config: AppConfigService): OpenApiInfo {
      return config.values.openapi as OpenApiInfo
    },
    inject: [AppConfigService] as const,
    root: rootModule,
    renderer: new BearerDocsRenderer(),
  })
