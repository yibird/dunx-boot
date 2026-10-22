import { Module } from '@dunx/core'
import { AiAgentController } from './controller'
import { AiAgentRepository } from './repository'
import { AiAgentService } from './service'

@Module({
  controllers: [AiAgentController],
  providers: [AiAgentRepository, AiAgentService],
  exports: [AiAgentRepository, AiAgentService],
})
export class AiAgentModule {}
