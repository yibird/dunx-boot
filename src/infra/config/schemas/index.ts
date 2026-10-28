import { z } from 'zod'
import { application } from './application'
import { server } from './server'
import { log } from './log'
import { openapi } from './openapi'
import { database } from './database'
import { cache } from './cache'
import { security } from './security'
import { redis } from './redis'
import { schedule } from './schedule'
import { health } from './health'
import { resilience } from './resilience'
import { client } from './client'
import { queue } from './queue'
import { files } from './files'
import { images } from './images'
import { email } from './email'
import { dashboard } from './dashboard'
import { seed } from './seed'
import { tracing } from './tracing'
import { ai } from './ai'
import { requestLog } from './request-log'

export const config = z.object({
  application,
  server,
  log,
  openapi,
  database,
  cache,
  security,
  redis,
  schedule,
  health,
  resilience,
  client,
  queue,
  files,
  images,
  email,
  dashboard,
  seed,
  tracing,
  ai,
  requestLog,
})

export type AppConfig = DeepReadonly<z.output<typeof config>>
export type ApplicationConfig = AppConfig['application']
export type ServerConfig = AppConfig['server']
export type LogConfig = AppConfig['log']
export type OpenapiConfig = AppConfig['openapi']
export type DatabaseConfig = AppConfig['database']
export type CacheConfig = AppConfig['cache']
export type SecurityConfig = AppConfig['security']
export type AuthConfig = AppConfig['security']['auth']
export type CorsConfig = AppConfig['security']['cors']
export type RedisConfig = AppConfig['redis']
export type ScheduleConfig = AppConfig['schedule']
export type HealthConfig = AppConfig['health']
export type ResilienceConfig = AppConfig['resilience']
export type ThrottleConfig = AppConfig['resilience']['throttle']
export type ClientConfig = AppConfig['client']
export type QueueConfig = AppConfig['queue']
export type FilesConfig = AppConfig['files']
export type ImagesConfig = AppConfig['images']
export type EmailConfig = AppConfig['email']
export type DashboardConfig = AppConfig['dashboard']
export type SeedConfig = AppConfig['seed']
export type TracingConfig = AppConfig['tracing']
export type AiConfig = AppConfig['ai']
export type RequestLogConfig = AppConfig['requestLog']
