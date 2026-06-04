import { Sparkles, Wifi, PanelLeft } from 'lucide-react';
import { MessageList } from '@/components/MessageList';
import { ChatInput } from '@/components/ChatInput';
import type { Message } from '@/types';

interface ChatWidgetProps {
  messages: Message[];
  isLoading: boolean;
  isLoadingSession: boolean;
  error: string | null;
  sessionId: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
  onMenuClick: () => void;
}

export function ChatWidget({
  messages,
  isLoading,
  isLoadingSession,
  error,
  sessionId,
  sendMessage,
  clearError,
  onMenuClick,
}: ChatWidgetProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3.5 border-b border-white/6 bg-zinc-900/60 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-zinc-500 hover:text-white transition-colors p-1 -ml-1 rounded"
          aria-label="Open sidebar"
          id="open-sidebar-btn"
        >
          <PanelLeft size={18} />
        </button>

        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow flex-shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm leading-tight">
            ManiiiHeist Commerce Support
          </h1>
          <p className="text-zinc-500 text-xs truncate">
            {sessionId
              ? `Session: ${sessionId.slice(0, 8)}…`
              : 'New conversation'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 text-xs font-medium hidden sm:flex items-center gap-1">
            <Wifi size={10} />
            Online
          </span>
        </div>
      </header>

      {/* Message Feed */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        isLoadingSession={isLoadingSession}
        error={error}
        onClearError={clearError}
      />

      {/* Input — disabled while session is loading */}
      <ChatInput onSend={sendMessage} isLoading={isLoading || isLoadingSession} />
    </div>
  );
}
