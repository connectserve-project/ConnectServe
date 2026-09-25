import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { VerifiedOrgBadge } from '../common/Badge';
import { userService } from '../../services/userService';

export const NewChatModal = ({ isOpen, onClose, onSelectUser, currentUserId, starting }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
      runSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const runSearch = async (q) => {
    setLoading(true);
    try {
      const res = await userService.searchUsers({ q, limit: 20 });
      if (res.success && res.data) {
        const users = (res.data.users || []).filter(
          (u) => String(u._id || u.id) !== String(currentUserId)
        );
        setResults(users);
      }
    } catch (err) {
      // Silently ignore; user can retry by typing again.
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md mt-16 sm:mt-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">New Chat</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search by name or username..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 italic">
              No users found.
            </div>
          ) : (
            results.map((u) => {
              const uid = u._id || u.id;
              return (
                <button
                  key={uid}
                  disabled={starting}
                  onClick={() => onSelectUser(u)}
                  className="w-full p-3 sm:p-4 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-60 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0"
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
                      {u.role === 'organization'
                        ? 'NGO / Organization'
                        : u.role === 'admin'
                        ? 'Admin'
                        : 'Volunteer'}
                      {u.username ? ` \u00b7 @${u.username}` : ''}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
