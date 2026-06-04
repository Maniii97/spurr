import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { MessageBubble } from '@/components/MessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';
import type { Message } from '@/types';
import { AlertCircle, X } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isLoadingSession: boolean;
  error: string | null;
  onClearError: () => void;
}

export function MessageList({
  messages,
  isLoading,
  isLoadingSession,
  error,
  onClearError,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or loading state change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Show full-area spinner while fetching session history
  if (isLoadingSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Spinner size="lg" className="text-violet-500" />
        <p className="text-sm animate-pulse">Loading conversation…</p>
      </div>
    );
  }

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 flex flex-col gap-4">
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <div>
                <p className="text-zinc-300 font-medium">Hi there!</p>
                <p className="text-zinc-500 text-sm mt-1">
                  Ask me anything about shipping, returns, or orders.
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/40 border border-red-500/30 text-red-300 text-sm animate-fade-in-up">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={onClearError}
            className="flex-shrink-0 text-red-400 hover:text-red-200 transition-colors"
            aria-label="Dismiss error"
            id="dismiss-error-btn"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
