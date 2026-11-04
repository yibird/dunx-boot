import { Module } from '@dunx/core'
import { sysEventModules } from './sys'

@Module({
  imports: [...sysEventModules],
  exports: [],
})
export class EventHandlerModule {}

export * from './sys'
