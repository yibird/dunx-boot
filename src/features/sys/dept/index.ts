import { Module } from '@dunx/core'
import { SysDeptRepository } from './repository'
import { SysDeptService } from './service'
import { SysDeptController } from './controller'

@Module({
  imports: [],
  controllers: [SysDeptController],
  providers: [SysDeptRepository, SysDeptService],
})
export class SysDeptModule {}
