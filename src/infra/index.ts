import { ConfigModule, Module } from '@dunx/core'
import { FeatureModule } from '@/features'
import { WsModule } from '@/ws'
import { AppConfigService, getConfigFiles, configSchema } from './config'
import { AppDbModule } from './db'
import { AppRedisModule } from './redis'
import { AppCacheModule } from './cache'
import { AppThrottleModule } from './throttle'
import { AppScheduleModule } from './schedule'
import { AppHealthModule } from './health'
import { AppEventBusModule } from './events'
import { AppResilienceModule } from './resilience'
import { AppHttpClientModule } from './client'
import { AppQueueModule } from './queue'
import { AppFilesModule } from './files'
import { AppImagesModule } from './images'
import { AppEmailModule } from './email'
import { AppDashboardModule } from './dashboard'
import { HttpModule } from './http'
import { AppLoggerModule } from './log'
import { AppTracingModule } from './tracing'
import { EventListenerModule } from '@/events'

/**
 * 基础设施模块
 */
export const infraModules = [
  ConfigModule.forRoot({
    files: getConfigFiles(),
    schema: configSchema,
    as: AppConfigService,
  }),
  AppTracingModule,
  AppLoggerModule,
  AppDbModule,
  AppRedisModule,
  AppCacheModule,
  AppQueueModule,
  AppEventBusModule,
  AppResilienceModule,
  AppHttpClientModule,
  AppFilesModule,
  AppImagesModule,
  AppEmailModule,
  AppThrottleModule,
  AppScheduleModule,
  HttpModule,
  AppHealthModule,
  AppDashboardModule,
]

@Module({
  imports: [...infraModules, FeatureModule, EventListenerModule, WsModule],
  exports: [],
})
export class AppModule {}
