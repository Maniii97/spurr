import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import type { ConversationSummary } from '@/types';
import { MessageSquare, Plus, Sparkles, X, Trash2 } from 'lucide-react';

interface SidebarProps {
  conversations: ConversationSummary[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

type GroupKey = 'Today' | 'Yesterday' | 'Last 7 days' | 'Older';

function groupConversations(
  convs: ConversationSummary[],
): Record<GroupKey, ConversationSummary[]> {
  const now = Date.now();
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfYesterday = startOfToday - 86_400_000;
  const startOfLastWeek = startOfToday - 7 * 86_400_000;

  const groups: Record<GroupKey, ConversationSummary[]> = {
    Today: [],
    Yesterday: [],
    'Last 7 days': [],
    Older: [],
  };

  for (const conv of convs) {
    const t = conv.updatedAt;
    if (t >= startOfToday) groups.Today.push(conv);
    else if (t >= startOfYesterday) groups.Yesterday.push(conv);
    else if (t >= startOfLastWeek) groups['Last 7 days'].push(conv);
    else groups.Older.push(conv);
  }

  // suppress "unused" warning
  void now;
  return groups;
}

export function Sidebar({
  conversations,
  activeSessionId,
  onSelect,
  onNewChat,
  onDelete,
  open,
  onClose,
}: SidebarProps) {
  const groups = groupConversations(conversations);
  const ORDER: GroupKey[] = ['Today', 'Yesterday', 'Last 7 days', 'Older'];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-zinc-950 border-r border-white/6 transition-transform duration-300',
          'lg:relative lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/6">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="text-white font-semibold text-sm flex-1 truncate">
            ManiiiHeist Commerce
          </span>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden text-zinc-500 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* New Chat button */}
        <div className="px-3 py-3">
          <button
            id="new-chat-btn"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all duration-150 group"
          >
            <Plus size={15} className="text-zinc-400 group-hover:text-violet-400 transition-colors flex-shrink-0" />
            New chat
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
          {conversations.length === 0 && (
            <p className="text-zinc-600 text-xs text-center py-8 px-4">
              No conversations yet. Start chatting!
            </p>
          )}

          {ORDER.map((label) => {
            const items = groups[label];
            if (items.length === 0) return null;

            return (
              <div key={label}>
                <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wide px-2 mb-1.5">
                  {label}
                </p>
                <div className="space-y-0.5">
                  {items.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeSessionId}
                      onSelect={() => {
                        onSelect(conv.id);
                        onClose();
                      }}
                      onDelete={() => onDelete(conv.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}

interface ConversationItemProps {
  conv: ConversationSummary;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function ConversationItem({ conv, isActive, onSelect, onDelete }: ConversationItemProps) {
  const title = conv.title ?? 'New conversation';

  return (
    <div
      className={cn(
        'w-full flex items-center justify-between rounded-lg border transition-all duration-150 group relative',
        isActive
          ? 'bg-violet-600/15 text-white border-violet-500/25'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/6 border-transparent',
      )}
    >
      <button
        onClick={onSelect}
        title={title}
        className="flex-1 flex items-start gap-2.5 px-2 py-2 text-left text-sm min-w-0"
      >
        <MessageSquare
          size={13}
          className={cn(
            'flex-shrink-0 mt-0.5',
            isActive ? 'text-violet-400' : 'text-zinc-600 group-hover:text-zinc-400',
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="truncate text-xs font-medium leading-snug">{title}</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            {formatRelativeTime(conv.updatedAt)}
          </p>
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm('Are you sure you want to delete this conversation?')) {
            onDelete();
          }
        }}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 mr-1 text-zinc-500 hover:text-red-400 rounded-md hover:bg-white/5 flex-shrink-0"
        aria-label="Delete conversation"
        title="Delete conversation"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
