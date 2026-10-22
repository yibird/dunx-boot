import { Module } from '@dunx/core'
import { AiSkillController } from './controller'
import { AiSkillRepository } from './repository'
import { AiSkillService } from './service'

@Module({
  controllers: [AiSkillController],
  providers: [AiSkillRepository, AiSkillService],
  exports: [AiSkillService, AiSkillRepository],
})
export class AiSkillModule {}
