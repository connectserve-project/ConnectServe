import React, { useState } from 'react';
import { Home, MessageSquarePlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { VerifiedOrgBadge } from '../common/Badge';
import { formatTimeAgo } from '../../utils/dateUtils';
import { Search } from 'lucide-react';

export const ChatList = ({
  conversations,
  directoryUsers = [],
  activeConversation,
  onSelectConversation,
  onSelectUser,
  starting = false,
  currentUserId,
  isAdmin = false,
  onOpenNewChat,
}) => {
  const [search, setSearch] = useState('');
  const homeTo = isAdmin ? '/admin' : '/feed';

  const filtered = conversations.filter((conv) => {
    const other = conv.participants.find(p => p._id !== currentUserId);
    if (!other) return false;
    return other.name.toLowerCase().includes(search.toLowerCase());
  });

  // Users from the directory (all NGOs/volunteers, admin-only) who don't
  // already have a conversation — shown by default so admin can message
  // anyone in one click, not just people they've already chatted with.
  const conversationUserIds = new Set(
    conversations.flatMap((conv) =>
      conv.participants.filter((p) => p._id !== currentUserId).map((p) => String(p._id))
    )
  );
  const newContacts = directoryUsers
    .filter((u) => !conversationUserIds.has(String(u._id)))
    .filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Messages
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNewChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-colors"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              New Chat
            </button>
            <Link
              to={homeTo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Go To Home
            </Link>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {filtered.length === 0 && newContacts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 italic">
            No conversations found.
          </div>
        ) : (
          filtered.map((conv) => {
            const other = conv.participants.find(p => p._id !== currentUserId);
            const isActive = activeConversation?._id === conv._id;

            return (
              <button
                key={conv._id}
                onClick={() => onSelectConversation(conv)}
                className={`w-full p-4 flex items-center gap-3 text-left transition-colors min-h-[64px] ${isActive
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
              >
                <Avatar
                  src={other?.avatar}
                  size="md"
                  isOrg={other?.role === 'organization'}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {other?.name || 'User'}
                      </span>
                      {other?.role === 'organization' && (
                        <VerifiedOrgBadge isVerified={other?.orgDetails?.isVerified} />
                      )}
                    </div>
                    {conv.lastMessageAt && (
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatTimeAgo(conv.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {conv.lastMessageText || 'Started a conversation'}
                  </p>
                </div>
              </button>
            );
          })
        )}

        {newContacts.length > 0 && (
          <>
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Start a new chat
            </div>
            {newContacts.map((u) => (
              <button
                key={u._id}
                disabled={starting}
                onClick={() => onSelectUser(u)}
                className="w-full p-4 flex items-center gap-3 text-left transition-colors min-h-[64px] hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-60"
              >
                <Avatar src={u.avatar} size="md" isOrg={u.role === 'organization'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {u.name || 'User'}
                    </span>
                    {u.role === 'organization' && (
                      <VerifiedOrgBadge isVerified={u.orgDetails?.isVerified} />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {u.role === 'organization' ? 'NGO / Organization' : 'Volunteer'} &middot; Tap to message
                  </p>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
