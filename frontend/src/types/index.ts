export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: number;
}

export interface Session {
  sessionId: string;
  messages: Message[];
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

export interface SendMessageResponse {
  reply: string;
  sessionId: string;
}
