import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { chatService } from '../services/chatService';
import { adminService } from '../services/adminService';
import { ChatList } from '../components/chat/ChatList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { NewChatModal } from '../components/chat/NewChatModal';
import { MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export const ChatPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const isAdmin = user?.role === 'admin';
  const [conversations, setConversations] = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await chatService.getConversations();
      if (res.success && res.data) {
        setConversations(res.data.conversations || []);
        if (res.data.conversations?.length > 0 && !activeConversation) {
          // If desktop, select first conversation by default
          if (window.innerWidth >= 768) {
            setActiveConversation(res.data.conversations[0]);
          }
        }
      }
    } catch (err) {
      toast.error('Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch conversations and refresh the open chat's block flags (never auto-opens a chat)
  const refreshConversations = async () => {
    try {
      const res = await chatService.getConversations();
      if (res.success && res.data) {
        const list = res.data.conversations || [];
        setConversations(list);
        setActiveConversation((prev) => {
          if (!prev) return prev;
          const fresh = list.find((c) => String(c._id ?? c.id) === String(prev._id ?? prev.id));
          return fresh ? { ...prev, ...fresh } : prev;
        });
      }
    } catch (err) {
      // ignore - list stays as is
    }
  };

  const handleConversationDeleted = (conversationId) => {
    setConversations((prev) => prev.filter((c) => String(c._id ?? c.id) !== String(conversationId)));
    setActiveConversation(null);
  };

  const handleConversationUpdated = (updated) => {
    setConversations((prev) =>
      prev.map((c) => (String(c._id ?? c.id) === String(updated._id ?? updated.id) ? { ...c, ...updated } : c))
    );
    setActiveConversation((prev) =>
      prev && String(prev._id ?? prev.id) === String(updated._id ?? updated.id) ? { ...prev, ...updated } : prev
    );
  };

  // The other person blocked / unblocked you -> update the open chat live
  useEffect(() => {
    if (!socket) return undefined;
    const onBlockChanged = () => refreshConversations();
    socket.on('conversation_block_changed', onBlockChanged);
    return () => socket.off('conversation_block_changed', onBlockChanged);
  }, [socket]);

  // Keep the conversation list (last message / ordering) live
  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (msg) => {
      const convId = String(msg.conversationId ?? msg.conversation ?? '');
      let found = false;
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (String(c._id ?? c.id) !== convId) return c;
          found = true;
          return { ...c, lastMessageText: msg.text, lastMessageAt: msg.createdAt || new Date().toISOString() };
        });
        return updated.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      });
      // Message in a brand-new conversation: reload the list
      setTimeout(() => { if (!found) fetchConversations(); }, 0);
    };
    socket.on('new_message', onNewMessage);
    return () => socket.off('new_message', onNewMessage);
  }, [socket]);

  // Admins get every NGO/organization and volunteer listed by default,
  // so they can start a direct message with anyone without hunting them down.
  const fetchDirectory = async () => {
    if (!isAdmin) return;
    try {
      const [orgsRes, volsRes] = await Promise.all([
        adminService.getAllUsers({ role: 'organization', limit: 100 }),
        adminService.getAllUsers({ role: 'user', limit: 100 }),
      ]);
      const orgs = orgsRes?.data?.users || [];
      const vols = volsRes?.data?.users || [];
      setDirectoryUsers([...orgs, ...vols].filter((u) => String(u._id) !== String(user?._id)));
    } catch (err) {
      // Directory is a convenience layer; conversations still work without it.
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchDirectory();
  }, []);

  // Starting a chat from the directory: reuse an existing conversation if one
  // exists, otherwise create it on the fly via getOrCreateConversation.
  const handleSelectUser = async (targetUser) => {
    const existing = conversations.find((c) =>
      c.participants.some((p) => String(p._id) === String(targetUser._id))
    );
    if (existing) {
      setActiveConversation(existing);
      return;
    }
    setStarting(true);
    try {
      const res = await chatService.getOrCreateConversation(targetUser._id);
      if (res.success && res.data?.conversation) {
        const conv = res.data.conversation;
        setConversations((prev) => [conv, ...prev]);
        setActiveConversation(conv);
      }
    } catch (err) {
      toast.error('Could not start conversation.');
    } finally {
      setStarting(false);
      setIsNewChatOpen(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-120px)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden flex animate-fadeIn">
      {/* Sidebar List (hidden on mobile when chat is active) */}
      <div
        className={`w-full md:w-80 lg:w-96 h-full ${
          activeConversation ? 'hidden md:block' : 'block'
        }`}
      >
        <ChatList
          conversations={conversations}
          directoryUsers={directoryUsers}
          activeConversation={activeConversation}
          onSelectConversation={(conv) => setActiveConversation(conv)}
          onSelectUser={handleSelectUser}
          starting={starting}
          currentUserId={user?._id}
          isAdmin={isAdmin}
          onOpenNewChat={() => setIsNewChatOpen(true)}
        />
      </div>

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={handleSelectUser}
        currentUserId={user?._id}
        starting={starting}
      />

      {/* Main Chat Area */}
      <div
        className={`flex-1 h-full ${
          !activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            currentUserId={user?._id}
            onBack={() => setActiveConversation(null)}
            onConversationDeleted={handleConversationDeleted}
            onConversationUpdated={handleConversationUpdated}
            onRefreshConversations={refreshConversations}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-base text-slate-700 dark:text-slate-200">
              Direct Messages
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Select an organizer or volunteer from the left list to begin real-time messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
