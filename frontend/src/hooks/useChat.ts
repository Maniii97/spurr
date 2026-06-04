import { useState, useEffect, useCallback, useRef } from 'react';
import type { Message } from '@/types';
import { sendMessage as apiSendMessage, getSession } from '@/lib/api';

interface UseChatOptions {
  onSessionCreated: (id: string, initialTitle?: string) => void;
  onRefreshConversations?: () => void;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;       // true while waiting for AI reply
  isLoadingSession: boolean; // true while fetching session history on switch
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
}

export function useChat(
  sessionId: string | null,
  { onSessionCreated, onRefreshConversations }: UseChatOptions,
): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const justCreatedSessionIdRef = useRef<string | null>(null);

  // Load messages whenever the active session changes
  useEffect(() => {
    setError(null);
    if (!sessionId) {
      setMessages([]);
      return;
    }

    if (justCreatedSessionIdRef.current === sessionId) {
      justCreatedSessionIdRef.current = null;
      return;
    }

    setIsLoadingSession(true);
    getSession(sessionId)
      .then((session) => setMessages(session.messages))
      .catch(() => setMessages([]))
      .finally(() => setIsLoadingSession(false));
  }, [sessionId]);

  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const isNewSession = !sessionIdRef.current;
      const activeId = sessionIdRef.current || crypto.randomUUID();

      if (isNewSession) {
        sessionIdRef.current = activeId;
        justCreatedSessionIdRef.current = activeId;
        onSessionCreated(activeId, trimmed);
      }

      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMsg: Message = {
        id: optimisticId,
        sender: 'user',
        text: trimmed,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiSendMessage({
          message: trimmed,
          sessionId: activeId,
        });

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.reply,
          createdAt: Date.now() + 1,
        };

        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticId),
          { ...optimisticMsg, id: `user-${Date.now()}` },
          aiMsg,
        ]);

        onRefreshConversations?.();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to send. Please try again.';
        setError(message);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        if (isNewSession) {
          // Rollback if the first message failed to send
          sessionIdRef.current = null;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onSessionCreated, onRefreshConversations],
  );

  const clearError = useCallback(() => setError(null), []);

  return { messages, isLoading, isLoadingSession, error, sendMessage, clearError };
}
