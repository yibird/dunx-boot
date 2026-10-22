import { AiModelProviderModule } from './model-provider'
import { AiModelModule } from './model'
import { AiChatModule } from './chat'
import { AiAgentModule } from './agent'
import { AiSkillModule } from './skill'

export const AiModules = [
  AiModelProviderModule,
  AiModelModule,
  AiChatModule,
  AiAgentModule,
  AiSkillModule,
]
