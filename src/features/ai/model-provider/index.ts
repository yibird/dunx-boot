import { Module } from '@dunx/core'
import { AiModelProviderController } from './controller'
import { AiModelProviderRepository } from './repository'
import { AiModelProviderService } from './service'

@Module({
  controllers: [AiModelProviderController],
  providers: [AiModelProviderRepository, AiModelProviderService],
})
export class AiModelProviderModule {}
