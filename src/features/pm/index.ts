import { PmProjectModule } from './project'
import { PmProjectMemberModule } from './project-member'
import { PmTaskModule } from './task'
import { PmTaskLabelModule } from './task-label'
import { PmTaskLabelRelModule } from './task-label-rel'
import { PmTaskCommentModule } from './task-comment'
import { PmTaskAttachmentModule } from './task-attachment'
import { PmTaskActivityModule } from './task-activity'

export const PmModules = [
  PmProjectModule,
  PmProjectMemberModule,
  PmTaskModule,
  PmTaskLabelModule,
  PmTaskLabelRelModule,
  PmTaskCommentModule,
  PmTaskAttachmentModule,
  PmTaskActivityModule,
]
