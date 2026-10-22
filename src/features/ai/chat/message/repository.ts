import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'

/**
 * 会话消息；按当前租户隔离，读取只取已完成的消息。
 */
export class AiChatMessageRepository {
  constructor(private readonly db: BunSQLDatabase) {}
}
