import { Module } from '@dunx/core'
import { SysDictTypeController } from './controller'
import { SysDictTypeRepository } from './repository'
import { SysDictTypeService } from './service'

/**
 * 字典类型模块
 */
@Module({
  imports: [],
  controllers: [SysDictTypeController],
  providers: [SysDictTypeRepository, SysDictTypeService],
})
export class SysDictTypeModule {}
