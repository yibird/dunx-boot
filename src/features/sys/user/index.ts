import { Module } from '@dunx/core'
import { SysUserRepository } from './repository'
import { SysUserService } from './service'
import { SysUserController } from './controller'

@Module({
  imports: [],
  controllers: [SysUserController],
  providers: [SysUserRepository, SysUserService],
})
export class SysUserModule {}
