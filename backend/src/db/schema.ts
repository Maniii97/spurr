import { pgTable, text, bigint, index } from 'drizzle-orm/pg-core';

export const conversations = pgTable('conversations', {
  id: text('id').primaryKey().notNull(),
  title: text('title'),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
  metadata: text('metadata'),
  deletedAt: bigint('deleted_at', { mode: 'number' }),
});

export const messages = pgTable(
  'messages',
  {
    id: text('id').primaryKey().notNull(),
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    sender: text('sender', { enum: ['user', 'ai'] }).notNull(),
    text: text('text').notNull(),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  },
  (table) => [index('idx_messages_conv_id').on(table.conversationId)],
);

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
