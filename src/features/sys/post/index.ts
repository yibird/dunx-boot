import { Module } from '@dunx/core'
import { SysPostRepository } from './repository'
import { SysPostService } from './service'
import { SysPostController } from './controller'

@Module({
  imports: [],
  controllers: [SysPostController],
  providers: [SysPostRepository, SysPostService],
})
export class SysPostModule {}
