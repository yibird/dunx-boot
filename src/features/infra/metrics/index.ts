import { Module, RuntimeStats } from '@dunx/core'
import { SysMetricsController } from './controller'
import { SysMetricsService } from './service'
import { EventLoopLag } from '@dunx/core'

@Module({
  imports: [],
  controllers: [SysMetricsController],
  providers: [RuntimeStats, EventLoopLag, SysMetricsService],
})
export class SysMetricsModule {}
