import { Module, provide } from '@dunx/core'
import { CompressionModule, HttpOptionsProvider } from '@dunx/http'
import { AppHttpOptions } from './http-options'
import { AppErrorFilter } from './error-filter'

export * from './permission'

@Module({
  imports: [CompressionModule.forRoot({ threshold: 1024 })],
  providers: [
    AppErrorFilter,
    provide(HttpOptionsProvider, { useClass: AppHttpOptions }),
  ],
  exports: [AppErrorFilter],
})
export class HttpModule {}
