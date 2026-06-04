import { useState, useEffect, useCallback } from 'react';
import type { ConversationSummary } from '@/types';
import { listConversations } from '@/lib/api';

const SESSION_KEY = 'maniiiheist_chat_session_id';

interface UseConversationsReturn {
  conversations: ConversationSummary[];
  isLoadingConversations: boolean;
  activeSessionId: string | null;
  selectConversation: (id: string) => void;
  createNewChat: () => void;
  handleSessionCreated: (id: string, initialTitle?: string) => void;
  refreshConversations: () => Promise<void>;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_KEY);
  });

  const refreshConversations = useCallback(async () => {
    try {
      const list = await listConversations();
      setConversations(list);
    } catch {
      // silently ignore — sidebar is non-critical
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  const selectConversation = useCallback((id: string) => {
    setActiveSessionId(id);
    localStorage.setItem(SESSION_KEY, id);
  }, []);

  const createNewChat = useCallback(() => {
    setActiveSessionId(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const handleSessionCreated = useCallback(
    (id: string, initialTitle?: string) => {
      setActiveSessionId(id);
      localStorage.setItem(SESSION_KEY, id);
      
      if (initialTitle) {
        setConversations((prev) => {
          if (prev.some((c) => c.id === id)) return prev;
          
          const newConv: ConversationSummary = {
            id,
            title: initialTitle,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          return [newConv, ...prev];
        });
      } else {
        void refreshConversations();
      }
    },
    [refreshConversations],
  );

  return {
    conversations,
    isLoadingConversations,
    activeSessionId,
    selectConversation,
    createNewChat,
    handleSessionCreated,
    refreshConversations,
  };
}
