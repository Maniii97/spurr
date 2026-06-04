import { useState } from 'react';
import { useConversations } from '@/hooks/useConversations';
import { useChat } from '@/hooks/useChat';
import { Sidebar } from '@/components/Sidebar';
import { ChatWidget } from '@/components/ChatWidget';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    conversations,
    activeSessionId,
    selectConversation,
    createNewChat,
    handleSessionCreated,
    refreshConversations,
  } = useConversations();

  const {
    messages,
    isLoading,
    isLoadingSession,
    error,
    sendMessage,
    clearError,
  } = useChat(activeSessionId, {
    onSessionCreated: handleSessionCreated,
    onRefreshConversations: refreshConversations,
  });

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeSessionId={activeSessionId}
        onSelect={selectConversation}
        onNewChat={createNewChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Subtle ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl" />
        </div>

        <div className="relative flex flex-col h-full bg-zinc-900 lg:border-l lg:border-white/6">
          <ChatWidget
            messages={messages}
            isLoading={isLoading}
            isLoadingSession={isLoadingSession}
            error={error}
            sessionId={activeSessionId}
            sendMessage={sendMessage}
            clearError={clearError}
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>
      </main>
    </div>
  );
}
