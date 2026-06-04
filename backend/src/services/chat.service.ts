import {
  findOrCreateConversation,
  getConversationMessages,
  addMessage,
  setConversationTitle,
} from './conversation.service';
import { generateReply } from './llm.service';
import type { ChatResponse, LLMHistoryEntry } from '../types';

const MAX_MESSAGE_LENGTH = 2000;

function generateTitle(text: string): string {
  const trimmed = text.trim();
  return trimmed.length > 60 ? trimmed.slice(0, 60) + '…' : trimmed;
}

export async function processMessage(
  rawMessage: string,
  sessionId?: string,
): Promise<ChatResponse> {
  // Truncate if over limit (do not crash)
  const userMessage =
    rawMessage.length > MAX_MESSAGE_LENGTH
      ? rawMessage.slice(0, MAX_MESSAGE_LENGTH)
      : rawMessage;

  // 1. Find or create the conversation
  const conversation = await findOrCreateConversation(sessionId);

  // 2. Persist user message to DB
  await addMessage(conversation.id, 'user', userMessage);

  // 3. Fetch all messages for context + title generation
  const allMessages = await getConversationMessages(conversation.id);

  // 4. Auto-set title from first user message
  if (allMessages.length === 1 && !conversation.title) {
    await setConversationTitle(conversation.id, generateTitle(userMessage));
  }

  // 5. Build history — exclude the just-added user message, cap at 10
  const historyMessages = allMessages.slice(0, -1).slice(-10);
  const history: LLMHistoryEntry[] = historyMessages.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    content: msg.text,
  }));

  // 6. Call LLM — this never throws (errors returned as friendly strings)
  const reply = await generateReply(history, userMessage);

  // 7. Persist AI reply to DB
  await addMessage(conversation.id, 'ai', reply);

  return { reply, sessionId: conversation.id };
}
