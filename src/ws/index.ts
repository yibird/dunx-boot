import { Module } from '@dunx/core'
import { SysAuthModule } from '@/features/sys/auth'

/**
 * 集中注册 WebSocket 网关，业务服务由对应功能模块提供。
 */
@Module({
  imports: [SysAuthModule],
  providers: [],
})
export class WsModule {}
