import { Module } from '@dunx/core'
import { infraModules } from './infra'
import { SysModules } from './sys'
import { AiModules } from './ai'
import { PmModules } from './pm'

@Module({
  imports: [...infraModules, ...SysModules, ...AiModules, ...PmModules],
  exports: [],
})
export class FeatureModule {}
