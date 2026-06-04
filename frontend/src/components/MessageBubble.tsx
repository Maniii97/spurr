import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import type { Message } from '@/types';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div
      className={cn(
        'flex gap-2.5 items-end animate-fade-in-up',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
          isUser
            ? 'bg-violet-600 text-white'
            : 'bg-zinc-700 text-zinc-300',
        )}
        aria-label={isUser ? 'You' : 'AI Support Agent'}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[75%] flex flex-col gap-1',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-violet-600 text-white rounded-br-sm'
              : 'bg-zinc-800 text-zinc-100 border border-white/5 rounded-bl-sm',
          )}
        >
          {message.text}
        </div>
        <span className="text-[11px] text-zinc-600 px-1">
          {formatRelativeTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
