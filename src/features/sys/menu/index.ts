import { Module } from '@dunx/core'
import { SysMenuRepository } from './repository'
import { SysMenuService } from './service'
import { SysMenuController } from './controller'

@Module({
  imports: [],
  controllers: [SysMenuController],
  providers: [SysMenuRepository, SysMenuService],
})
export class SysMenuModule {}
