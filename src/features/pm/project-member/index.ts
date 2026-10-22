import { Module } from '@dunx/core'
import { PmProjectMemberController } from './controller'
import { PmProjectMemberRepository } from './repository'
import { PmProjectMemberService } from './service'

/**
 * 项目成员模块
 */
@Module({
  imports: [],
  controllers: [PmProjectMemberController],
  providers: [PmProjectMemberRepository, PmProjectMemberService],
})
export class PmProjectMemberModule {}
