import { Module } from '@dunx/core'
import { MastraModule } from '@/mastra/module'
import { AiChatController } from './controller'
import { AiChatService } from './service'
import { AiChatSessionRepository } from './session'

@Module({
  imports: [MastraModule],
  controllers: [AiChatController],
  providers: [AiChatSessionRepository, AiChatService],
  exports: [],
})
export class AiChatModule {}
