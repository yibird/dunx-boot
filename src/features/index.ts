import { Module } from '@dunx/core'
import { infraModules } from './infra'
import { SysModules } from './sys'
import { AiModules } from './ai'
import { PmModules } from './pm'
import { ScheduleModules } from '@/schedule'

@Module({
  imports: [
    ...infraModules,
    ...SysModules,
    ...AiModules,
    ...PmModules,
    ...ScheduleModules,
  ],
  exports: [],
})
export class FeatureModule {}
