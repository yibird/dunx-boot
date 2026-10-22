import { LoggerModule } from '@dunx/infra/logger'
import { AppConfigService, getEnv, isDev } from '../config'
import { devTransport, prodTransport } from './transport'

export const AppLoggerModule = LoggerModule.forRootAsync({
  useFactory: (config: AppConfigService) => {
    const { name, version } = config.values.application
    const { level, file } = config.values.log
    return {
      name,
      version,
      level,
      env: getEnv(),
      isDevelopment: isDev(),
      transports: isDev() ? devTransport() : prodTransport(file),
    }
  },
  inject: [AppConfigService] as const,
})
