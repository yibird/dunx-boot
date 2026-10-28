import { Module } from '@dunx/core'
import { SysCaptchaLogRepository } from './repository'
import { SysCaptchaLogService } from './service'
import { SysCaptchaLogController } from './controller'

@Module({
  imports: [],
  controllers: [SysCaptchaLogController],
  providers: [SysCaptchaLogRepository, SysCaptchaLogService],
})
export class SysCaptchaLogModule {}

export { SysCaptchaLogRepository }
