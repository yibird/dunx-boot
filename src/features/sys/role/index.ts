import { Module } from '@dunx/core'
import { SysRoleRepository } from './repository'
import { SysRoleService } from './service'
import { SysRoleController } from './controller'

@Module({
  imports: [],
  controllers: [SysRoleController],
  providers: [SysRoleRepository, SysRoleService],
})
export class SysRoleModule {}
