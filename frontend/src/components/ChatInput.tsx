import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { SendHorizonal } from 'lucide-react';


const MAX_LENGTH = 2000;

interface ChatInputProps {
  onSend: (text: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const canSend = value.trim().length > 0 && !isLoading;

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    const text = value;
    setValue('');
    await onSend(text);
    inputRef.current?.focus();
  }, [canSend, value, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  const charsLeft = MAX_LENGTH - value.length;
  const isNearLimit = charsLeft <= 200;

  return (
    <div className="px-4 pb-4 pt-2 border-t border-white/5">
      <div className="flex gap-2 items-end">
        <div className="flex-1 flex flex-col gap-1">
          <Input
            ref={inputRef}
            id="chat-input"
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            disabled={isLoading}
            autoComplete="off"
            aria-label="Chat message input"
          />
          {isNearLimit && (
            <p
              className={`text-[11px] text-right pr-1 ${
                charsLeft <= 50 ? 'text-red-400' : 'text-zinc-500'
              }`}
            >
              {charsLeft} / {MAX_LENGTH}
            </p>
          )}
        </div>

        <Button
          id="send-message-btn"
          size="icon"
          onClick={() => void handleSend()}
          disabled={!canSend}
          aria-label={isLoading ? 'Waiting for reply' : 'Send message'}
          className="flex-shrink-0"
        >
          {isLoading ? (
            <Spinner size="sm" className="text-white/70" />
          ) : (
            <SendHorizonal size={16} />
          )}
        </Button>
      </div>
    </div>
  );
}
