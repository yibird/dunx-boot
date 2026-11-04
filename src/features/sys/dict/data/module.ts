import { Module } from '@dunx/core'
import { SysDictDataController } from './controller'
import { SysDictDataRepository } from './repository'
import { SysDictDataService } from './service'

@Module({
  imports: [],
  controllers: [SysDictDataController],
  providers: [SysDictDataRepository, SysDictDataService],
})
export class SysDictDataModule {}
