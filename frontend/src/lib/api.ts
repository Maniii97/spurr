import type { SendMessageRequest, SendMessageResponse, Session, ConversationSummary } from '@/types';

const API_URL = import.meta.env.VITE_API_URL as string;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      errorMessage = body.error ?? errorMessage;
    } catch {
      // body is not JSON
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export async function sendMessage(
  payload: SendMessageRequest,
): Promise<SendMessageResponse> {
  const response = await fetch(`${API_URL}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<SendMessageResponse>(response);
}

export async function getSession(sessionId: string): Promise<Session> {
  const response = await fetch(`${API_URL}/chat/${encodeURIComponent(sessionId)}`);
  return handleResponse<Session>(response);
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const response = await fetch(`${API_URL}/chat/conversations`);
  const data = await handleResponse<{ conversations: ConversationSummary[] }>(response);
  return data.conversations;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_URL}/chat/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  });
  await handleResponse<{ success: boolean }>(response);
}
