import { Module, RuntimeStats, provide } from '@dunx/core'
import { QueryMetrics } from '@/infra/db/query-metrics'
import { dbQueryMetrics } from '@/infra/db/db'
import { SysMetricsController } from './controller'
import { SysMetricsService } from './service'
import { EventLoopLag } from '@dunx/core'

@Module({
  imports: [],
  controllers: [SysMetricsController],
  providers: [
    RuntimeStats,
    EventLoopLag,
    SysMetricsService,
    // createDb 在构建连接池时就开始计时，这里只是把同一个实例暴露给容器。
    provide(QueryMetrics, { useValue: dbQueryMetrics }),
  ],
})
export class SysMetricsModule {}
