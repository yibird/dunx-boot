import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

/**
 * Drizzle 1.0 关系定义，交给 drizzle({ relations })。
 * 显式保留连接列、同表多关系的别名及原非空关系的返回类型。
 */
export const relations = defineRelations(schema, (r) => ({
  sysRole: {
    users: r.many.sysUser(),
  },
  sysDept: {
    users: r.many.sysUser(),
  },
  sysPost: {
    users: r.many.sysUser(),
  },
  sysDictType: {
    data: r.many.sysDictData(),
  },
  sysUser: {
    role: r.one.sysRole({
      from: r.sysUser.roleId,
      to: r.sysRole.id,
    }),
    dept: r.one.sysDept({
      from: r.sysUser.deptId,
      to: r.sysDept.id,
    }),
    post: r.one.sysPost({
      from: r.sysUser.postId,
      to: r.sysPost.id,
    }),
    authIdentities: r.many.sysAuthIdentity(),
  },
  sysAuthIdentity: {
    user: r.one.sysUser({
      from: r.sysAuthIdentity.userId,
      to: r.sysUser.id,
      optional: false,
    }),
  },
  sysDictData: {
    type: r.one.sysDictType({
      from: r.sysDictData.dictTypeId,
      to: r.sysDictType.id,
      optional: false,
    }),
  },
  sysMessage: {
    reads: r.many.sysMessageRead(),
  },
  sysMessageRead: {
    message: r.one.sysMessage({
      from: r.sysMessageRead.messageId,
      to: r.sysMessage.id,
      optional: false,
    }),
    user: r.one.sysUser({
      from: r.sysMessageRead.userId,
      to: r.sysUser.id,
      optional: false,
    }),
  },
  sysNotice: {
    reads: r.many.sysNoticeRead(),
  },
  sysNoticeRead: {
    notice: r.one.sysNotice({
      from: r.sysNoticeRead.noticeId,
      to: r.sysNotice.id,
      optional: false,
    }),
    user: r.one.sysUser({
      from: r.sysNoticeRead.userId,
      to: r.sysUser.id,
      optional: false,
    }),
  },
  aiModelProvider: {
    models: r.many.aiModel(),
    usageRecords: r.many.aiUsageRecord(),
  },
  aiModel: {
    provider: r.one.aiModelProvider({
      from: r.aiModel.providerId,
      to: r.aiModelProvider.id,
      optional: false,
    }),
    agents: r.many.aiAgent(),
    chats: r.many.aiChat(),
    embeddingKnowledgeBases: r.many.aiKnowledgeBase({
      alias: 'embeddingModel',
    }),
    rerankKnowledgeBases: r.many.aiKnowledgeBase({
      alias: 'rerankModel',
    }),
    chunks: r.many.aiKnowledgeChunk(),
    usageRecords: r.many.aiUsageRecord(),
  },
  aiAgent: {
    owner: r.one.sysUser({
      from: r.aiAgent.ownerUserId,
      to: r.sysUser.id,
    }),
    model: r.one.aiModel({
      from: r.aiAgent.modelId,
      to: r.aiModel.id,
    }),
    knowledgeBases: r.many.aiAgentKnowledgeBase(),
    skills: r.many.aiAgentSkill(),
    sessions: r.many.aiAgentSession(),
    chats: r.many.aiChat(),
    usageRecords: r.many.aiUsageRecord(),
  },
  aiSkill: {
    owner: r.one.sysUser({
      from: r.aiSkill.ownerUserId,
      to: r.sysUser.id,
    }),
    agents: r.many.aiAgentSkill(),
  },
  aiAgentSkill: {
    agent: r.one.aiAgent({
      from: r.aiAgentSkill.agentId,
      to: r.aiAgent.id,
      optional: false,
    }),
    skill: r.one.aiSkill({
      from: r.aiAgentSkill.skillId,
      to: r.aiSkill.id,
      optional: false,
    }),
  },
  aiAgentKnowledgeBase: {
    agent: r.one.aiAgent({
      from: r.aiAgentKnowledgeBase.agentId,
      to: r.aiAgent.id,
      optional: false,
    }),
    knowledgeBase: r.one.aiKnowledgeBase({
      from: r.aiAgentKnowledgeBase.knowledgeBaseId,
      to: r.aiKnowledgeBase.id,
      optional: false,
    }),
  },
  aiKnowledgeBase: {
    owner: r.one.sysUser({
      from: r.aiKnowledgeBase.ownerUserId,
      to: r.sysUser.id,
    }),
    embeddingModel: r.one.aiModel({
      from: r.aiKnowledgeBase.embeddingModelId,
      to: r.aiModel.id,
      alias: 'embeddingModel',
    }),
    rerankModel: r.one.aiModel({
      from: r.aiKnowledgeBase.rerankModelId,
      to: r.aiModel.id,
      alias: 'rerankModel',
    }),
    agents: r.many.aiAgentKnowledgeBase(),
    documents: r.many.aiKnowledgeDocument(),
    chunks: r.many.aiKnowledgeChunk(),
    usageRecords: r.many.aiUsageRecord(),
  },
  aiKnowledgeDocument: {
    knowledgeBase: r.one.aiKnowledgeBase({
      from: r.aiKnowledgeDocument.knowledgeBaseId,
      to: r.aiKnowledgeBase.id,
      optional: false,
    }),
    chunks: r.many.aiKnowledgeChunk(),
  },
  aiKnowledgeChunk: {
    knowledgeBase: r.one.aiKnowledgeBase({
      from: r.aiKnowledgeChunk.knowledgeBaseId,
      to: r.aiKnowledgeBase.id,
      optional: false,
    }),
    document: r.one.aiKnowledgeDocument({
      from: r.aiKnowledgeChunk.documentId,
      to: r.aiKnowledgeDocument.id,
      optional: false,
    }),
    embeddingModel: r.one.aiModel({
      from: r.aiKnowledgeChunk.embeddingModelId,
      to: r.aiModel.id,
    }),
  },
  aiChat: {
    owner: r.one.sysUser({
      from: r.aiChat.ownerUserId,
      to: r.sysUser.id,
    }),
    agent: r.one.aiAgent({
      from: r.aiChat.agentId,
      to: r.aiAgent.id,
    }),
    model: r.one.aiModel({
      from: r.aiChat.modelId,
      to: r.aiModel.id,
    }),
    sessions: r.many.aiChatSession(),
    usageRecords: r.many.aiUsageRecord(),
  },
  aiChatSession: {
    chat: r.one.aiChat({
      from: r.aiChatSession.chatId,
      to: r.aiChat.id,
      optional: false,
    }),
    agent: r.one.aiAgent({
      from: r.aiChatSession.agentId,
      to: r.aiAgent.id,
    }),
    model: r.one.aiModel({
      from: r.aiChatSession.modelId,
      to: r.aiModel.id,
    }),
    messages: r.many.aiChatMessage(),
    agentSessions: r.many.aiAgentSession(),
    usageRecords: r.many.aiUsageRecord(),
  },
  aiAgentSession: {
    agent: r.one.aiAgent({
      from: r.aiAgentSession.agentId,
      to: r.aiAgent.id,
      optional: false,
    }),
    owner: r.one.sysUser({
      from: r.aiAgentSession.ownerUserId,
      to: r.sysUser.id,
      optional: false,
    }),
    chatSession: r.one.aiChatSession({
      from: r.aiAgentSession.chatSessionId,
      to: r.aiChatSession.id,
    }),
    model: r.one.aiModel({
      from: r.aiAgentSession.modelId,
      to: r.aiModel.id,
    }),
    messages: r.many.aiAgentMessage(),
    usageRecords: r.many.aiUsageRecord(),
  },
  aiAgentMessage: {
    session: r.one.aiAgentSession({
      from: r.aiAgentMessage.sessionId,
      to: r.aiAgentSession.id,
      optional: false,
    }),
    parent: r.one.aiAgentMessage({
      from: r.aiAgentMessage.parentId,
      to: r.aiAgentMessage.id,
    }),
    user: r.one.sysUser({
      from: r.aiAgentMessage.userId,
      to: r.sysUser.id,
    }),
    model: r.one.aiModel({
      from: r.aiAgentMessage.modelId,
      to: r.aiModel.id,
    }),
    usageRecords: r.many.aiUsageRecord(),
  },
  aiChatMessage: {
    session: r.one.aiChatSession({
      from: r.aiChatMessage.sessionId,
      to: r.aiChatSession.id,
      optional: false,
    }),
    parent: r.one.aiChatMessage({
      from: r.aiChatMessage.parentId,
      to: r.aiChatMessage.id,
    }),
    user: r.one.sysUser({
      from: r.aiChatMessage.userId,
      to: r.sysUser.id,
    }),
    model: r.one.aiModel({
      from: r.aiChatMessage.modelId,
      to: r.aiModel.id,
    }),
    usageRecords: r.many.aiUsageRecord(),
  },
  aiUsageRecord: {
    user: r.one.sysUser({
      from: r.aiUsageRecord.userId,
      to: r.sysUser.id,
    }),
    provider: r.one.aiModelProvider({
      from: r.aiUsageRecord.providerId,
      to: r.aiModelProvider.id,
    }),
    model: r.one.aiModel({
      from: r.aiUsageRecord.modelId,
      to: r.aiModel.id,
    }),
    agent: r.one.aiAgent({
      from: r.aiUsageRecord.agentId,
      to: r.aiAgent.id,
    }),
    agentSession: r.one.aiAgentSession({
      from: r.aiUsageRecord.agentSessionId,
      to: r.aiAgentSession.id,
    }),
    agentMessage: r.one.aiAgentMessage({
      from: r.aiUsageRecord.agentMessageId,
      to: r.aiAgentMessage.id,
    }),
    knowledgeBase: r.one.aiKnowledgeBase({
      from: r.aiUsageRecord.knowledgeBaseId,
      to: r.aiKnowledgeBase.id,
    }),
    chat: r.one.aiChat({
      from: r.aiUsageRecord.chatId,
      to: r.aiChat.id,
    }),
    session: r.one.aiChatSession({
      from: r.aiUsageRecord.sessionId,
      to: r.aiChatSession.id,
    }),
    message: r.one.aiChatMessage({
      from: r.aiUsageRecord.messageId,
      to: r.aiChatMessage.id,
    }),
  },
  pmProject: {
    members: r.many.pmProjectMember(),
    tasks: r.many.pmTask(),
    labels: r.many.pmTaskLabel(),
  },
  pmProjectMember: {
    project: r.one.pmProject({
      from: r.pmProjectMember.projectId,
      to: r.pmProject.id,
      optional: false,
    }),
    user: r.one.sysUser({
      from: r.pmProjectMember.userId,
      to: r.sysUser.id,
      optional: false,
    }),
  },
  pmTask: {
    project: r.one.pmProject({
      from: r.pmTask.projectId,
      to: r.pmProject.id,
      optional: false,
    }),
    parent: r.one.pmTask({
      from: r.pmTask.parentId,
      to: r.pmTask.id,
    }),
    children: r.many.pmTask(),
    assignee: r.one.sysUser({
      from: r.pmTask.assigneeId,
      to: r.sysUser.id,
    }),
    labelRels: r.many.pmTaskLabelRel(),
    comments: r.many.pmTaskComment(),
    attachments: r.many.pmTaskAttachment(),
    activities: r.many.pmTaskActivity(),
  },
  pmTaskLabel: {
    project: r.one.pmProject({
      from: r.pmTaskLabel.projectId,
      to: r.pmProject.id,
      optional: false,
    }),
    taskRels: r.many.pmTaskLabelRel(),
  },
  pmTaskLabelRel: {
    task: r.one.pmTask({
      from: r.pmTaskLabelRel.taskId,
      to: r.pmTask.id,
      optional: false,
    }),
    label: r.one.pmTaskLabel({
      from: r.pmTaskLabelRel.labelId,
      to: r.pmTaskLabel.id,
      optional: false,
    }),
  },
  pmTaskComment: {
    task: r.one.pmTask({
      from: r.pmTaskComment.taskId,
      to: r.pmTask.id,
      optional: false,
    }),
    user: r.one.sysUser({
      from: r.pmTaskComment.userId,
      to: r.sysUser.id,
      optional: false,
    }),
    parent: r.one.pmTaskComment({
      from: r.pmTaskComment.parentId,
      to: r.pmTaskComment.id,
    }),
  },
  pmTaskAttachment: {
    task: r.one.pmTask({
      from: r.pmTaskAttachment.taskId,
      to: r.pmTask.id,
      optional: false,
    }),
    file: r.one.sysFile({
      from: r.pmTaskAttachment.fileId,
      to: r.sysFile.id,
      optional: false,
    }),
  },
  pmTaskActivity: {
    project: r.one.pmProject({
      from: r.pmTaskActivity.projectId,
      to: r.pmProject.id,
      optional: false,
    }),
    task: r.one.pmTask({
      from: r.pmTaskActivity.taskId,
      to: r.pmTask.id,
      optional: false,
    }),
    user: r.one.sysUser({
      from: r.pmTaskActivity.userId,
      to: r.sysUser.id,
    }),
  },
}))
