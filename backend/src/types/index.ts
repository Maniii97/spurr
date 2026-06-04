// Shared TypeScript interfaces

export interface MessageRecord {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: number;
}

export interface ConversationRecord {
  id: string;
  title: string | null;
  createdAt: number;
  updatedAt: number;
  metadata: string | null;
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface SessionResponse {
  sessionId: string;
  messages: MessageRecord[];
}

export interface LLMHistoryEntry {
  role: 'user' | 'model';
  content: string;
}

export interface AppError extends Error {
  statusCode?: number;
}
