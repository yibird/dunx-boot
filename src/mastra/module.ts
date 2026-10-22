import { Module, provide } from '@dunx/core'
import { Mastra } from '@mastra/core'
import { mastra } from './index'

@Module({
  providers: [provide(Mastra, { useValue: mastra })],
  exports: [Mastra],
})
export class MastraModule {}
