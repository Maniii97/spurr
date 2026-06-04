import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-end animate-fade-in-up" aria-label="Agent is typing">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center">
        <Bot size={14} />
      </div>

      {/* Dots bubble */}
      <div className="bg-zinc-800 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full bg-zinc-400 animate-typing-dot"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-zinc-400 animate-typing-dot"
          style={{ animationDelay: '200ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-zinc-400 animate-typing-dot"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </div>
  );
}
