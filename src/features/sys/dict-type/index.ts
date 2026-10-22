import { Module } from '@dunx/core'
import { SysDictTypeController } from './controller'
import { SysDictTypeRepository } from './repository'
import { SysDictTypeService } from './service'

/**
 * 字典类型模块：**"标准域"的完整成本就是下面这些**。
 *
 * 控制器继承 `CrudController({...})`（九个端点 + 信封 + 状态码 + 分页 + 404 +
 * 入参校验 + OpenAPI 组件命名），模块里只给"服务"。
 * 自有端点写成 `SysDictTypeController` 的方法，不必再回到工厂配置。
 */
@Module({
  imports: [],
  controllers: [SysDictTypeController],
  providers: [SysDictTypeRepository, SysDictTypeService],
})
export class SysDictTypeModule {}
