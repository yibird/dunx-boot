import { Module } from '@dunx/core'
import { SysMessageController } from './controller'
import { SysMessageRepository } from './repository'
import { SysMessageService } from './service'

@Module({
  imports: [],
  controllers: [SysMessageController],
  providers: [SysMessageRepository, SysMessageService],
})
export class SysMessageModule {}
