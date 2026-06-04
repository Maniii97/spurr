import crypto from 'crypto';
import { eq, asc, desc, and, isNull } from 'drizzle-orm';
import { db } from '../db/client';
import { conversations, messages } from '../db/schema';
import type { MessageRecord, ConversationRecord, ConversationSummary } from '../types';

export async function findConversationById(
  sessionId: string,
): Promise<ConversationRecord | null> {
  const result = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, sessionId), isNull(conversations.deletedAt)))
    .limit(1);

  return result[0] ?? null;
}

export async function createConversation(suggestedId?: string): Promise<ConversationRecord> {
  const id = suggestedId || crypto.randomUUID();
  const now = Date.now();

  const result = await db
    .insert(conversations)
    .values({ id, createdAt: now, updatedAt: now })
    .returning();

  return result[0]!;
}

export async function findOrCreateConversation(
  sessionId?: string,
): Promise<ConversationRecord> {
  if (sessionId) {
    const existing = await findConversationById(sessionId);
    if (existing) return existing;
    return createConversation(sessionId);
  }
  return createConversation();
}

export async function setConversationTitle(
  id: string,
  title: string,
): Promise<void> {
  await db
    .update(conversations)
    .set({ title })
    .where(eq(conversations.id, id));
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const rows = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
    })
    .from(conversations)
    .where(isNull(conversations.deletedAt))
    .orderBy(desc(conversations.updatedAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function softDeleteConversation(id: string): Promise<void> {
  const now = Date.now();
  await db
    .update(conversations)
    .set({ deletedAt: now })
    .where(eq(conversations.id, id));
}

export async function getConversationMessages(
  conversationId: string,
): Promise<MessageRecord[]> {
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  return rows.map((row) => ({
    id: row.id,
    sender: row.sender as 'user' | 'ai',
    text: row.text,
    createdAt: row.createdAt,
  }));
}

export async function addMessage(
  conversationId: string,
  sender: 'user' | 'ai',
  text: string,
): Promise<MessageRecord> {
  const id = crypto.randomUUID();
  const now = Date.now();

  const result = await db
    .insert(messages)
    .values({ id, conversationId, sender, text, createdAt: now })
    .returning();

  const row = result[0]!;

  await db
    .update(conversations)
    .set({ updatedAt: now })
    .where(eq(conversations.id, conversationId));

  return {
    id: row.id,
    sender: row.sender as 'user' | 'ai',
    text: row.text,
    createdAt: row.createdAt,
  };
}
