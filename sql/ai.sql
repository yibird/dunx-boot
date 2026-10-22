-- AI 模块初始数据（开发环境示例）。必须先执行 `bun run db:migrate` 建表，本文件不负责建表。
-- 说明：ai_model_provider 只保留编码与名称，凭据不再随表存储；
--       ai_chat_session / ai_agent_session / 各类 message / knowledge_chunk / usage_record 等
--       均为运行时产生数据，此处不做种子插入。
-- 租户统一使用 tenant_id = 1（总公司），创建人统一 creator_name = 'system'。

-- 模型供应商
INSERT INTO "ai_model_provider" (
  "id", "provider_code", "provider_name", "internal",
  "tenant_id", "data_status", "creator_name"
) VALUES
  (1, 'openai', 'OpenAI', false, 1, true, 'system'),
  (2, 'deepseek', 'DeepSeek', false, 1, true, 'system'),
  (3, 'dashscope', '阿里云百炼', false, 1, true, 'system')
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('ai_model_provider', 'id'), (SELECT MAX("id") FROM "ai_model_provider"), true);

-- 模型配置
INSERT INTO "ai_model" (
  "id", "provider_id", "model_key", "model_name", "model_type",
  "context_window", "max_output_tokens", "embedding_dimensions",
  "supports_streaming", "supports_tools", "supports_vision", "supports_reasoning",
  "default_temperature", "default_top_p", "input_token_price", "output_token_price",
  "price_unit_tokens", "currency", "config", "tenant_id", "data_status", "creator_name"
) VALUES
  (1, 1, 'gpt-4o-mini', 'GPT-4o mini', 'chat',
   128000, 16384, NULL, true, true, true, false,
   0.7, 1, '0.15', '0.60', 1000000, 'USD', '{}'::jsonb, 1, true, 'system'),
  (2, 1, 'text-embedding-3-small', 'Text Embedding 3 Small', 'embedding',
   8191, NULL, 1536, false, false, false, false,
   0, 1, '0.02', '0', 1000000, 'USD', '{}'::jsonb, 1, true, 'system'),
  (3, 2, 'deepseek-chat', 'DeepSeek Chat', 'chat',
   64000, 8192, NULL, true, true, false, false,
   0.7, 1, '0.27', '1.10', 1000000, 'USD', '{}'::jsonb, 1, true, 'system'),
  (4, 3, 'bge-m3', 'BGE M3 Embedding', 'embedding',
   8192, NULL, 1024, false, false, false, false,
   0, 1, '0.007', '0', 1000, 'CNY', '{}'::jsonb, 1, true, 'system')
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('ai_model', 'id'), (SELECT MAX("id") FROM "ai_model"), true);

-- 知识库（RAG）
INSERT INTO "ai_knowledge_base" (
  "id", "owner_user_id", "embedding_model_id", "rerank_model_id", "name", "description",
  "icon", "vector_store", "collection_name", "embedding_dimensions",
  "chunk_strategy", "chunk_size", "chunk_overlap", "retrieval_mode",
  "retrieval_top_k", "similarity_threshold", "config", "tenant_id", "data_status", "creator_name"
) VALUES
  (1, '1', '2', NULL, '通用示例知识库', '演示用的通用文档知识库',
   'i-lucide:book-open', 'external', 'demo_kb', 1536,
   'recursive', 800, 120, 'vector',
   5, 0.7, '{}'::jsonb, 1, true, 'system')
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('ai_knowledge_base', 'id'), (SELECT MAX("id") FROM "ai_knowledge_base"), true);

-- Agent
INSERT INTO "ai_agent" (
  "id", "owner_user_id", "model_id", "name", "description", "icon", "visibility",
  "system_prompt", "welcome_message", "suggested_questions",
  "temperature", "top_p", "max_output_tokens", "memory_enabled", "config",
  "tenant_id", "data_status", "creator_name"
) VALUES
  (1, '1', '1', '通用助手', '默认演示 Agent，可对话与检索知识库',
   'i-lucide:bot', 'tenant',
   '你是一个乐于助人的通用 AI 助手，请简洁、准确地回答用户问题。',
   '你好，我是通用助手，有什么可以帮你？',
   '["你能做什么？", "帮我写一封邮件", "解释一个技术概念"]'::jsonb,
   0.7, 1, NULL, true, '{}'::jsonb, 1, true, 'system')
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('ai_agent', 'id'), (SELECT MAX("id") FROM "ai_agent"), true);

-- Agent 与知识库绑定
INSERT INTO "ai_agent_knowledge_base" (
  "id", "agent_id", "knowledge_base_id", "retrieval_top_k", "similarity_threshold",
  "query_rewrite", "citation_enabled", "metadata_filter", "tenant_id", "data_status", "creator_name"
) VALUES
  (1, '1', '1', 5, 0.7, false, true, '{}'::jsonb, 1, true, 'system')
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('ai_agent_knowledge_base', 'id'), (SELECT MAX("id") FROM "ai_agent_knowledge_base"), true);

-- 对话（Chat）
INSERT INTO "ai_chat" (
  "id", "owner_user_id", "agent_id", "model_id", "name", "description",
  "icon", "chat_type", "visibility", "system_prompt", "welcome_message", "suggested_questions",
  "temperature", "top_p", "max_output_tokens", "memory_enabled", "config",
  "tenant_id", "data_status", "creator_name"
) VALUES
  (1, '1', '1', '1', '默认助手', '基于通用助手的演示对话',
   'i-lucide:message-square', 'agent', 'private',
   '你是一个乐于助人的通用 AI 助手。',
   '你好，有什么可以帮你？',
   '["开始新话题", "帮我总结要点"]'::jsonb,
   0.7, 1, NULL, true, '{}'::jsonb, 1, true, 'system')
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('ai_chat', 'id'), (SELECT MAX("id") FROM "ai_chat"), true);
