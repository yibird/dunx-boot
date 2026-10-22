import { Module } from '@dunx/core'
import { AiModelController } from './controller'
import { AiModelRepository } from './repository'
import { AiModelService } from './service'

@Module({
  controllers: [AiModelController],
  providers: [AiModelRepository, AiModelService],
})
export class AiModelModule {}

export * from './constant'
