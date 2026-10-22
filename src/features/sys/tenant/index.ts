import { Module } from '@dunx/core'
import { SysTenantRepository } from './repository'
import { SysTenantService } from './service'
import { SysTenantController } from './controller'

@Module({
  imports: [],
  controllers: [SysTenantController],
  providers: [SysTenantRepository, SysTenantService],
})
export class SysTenantModule {}
