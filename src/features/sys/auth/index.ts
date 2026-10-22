import { Module } from '@dunx/core'
import { SysAuthController } from './controller'
import { SysAuthRepository } from './repository'
import { SysAuthService } from './service'
import { SysRoleRepository } from '../role/repository'
import { SysUserRepository } from '../user/repository'

@Module({
  imports: [],
  controllers: [SysAuthController],
  providers: [
    SysAuthRepository,
    SysRoleRepository,
    SysUserRepository,
    SysAuthService,
  ],
  exports: [SysAuthService],
})
export class SysAuthModule {}
