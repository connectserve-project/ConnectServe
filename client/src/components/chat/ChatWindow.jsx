import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { VerifiedOrgBadge } from '../common/Badge';
import { MessageItem } from './MessageItem';
import { chatService } from '../../services/chatService';
import { useSocket } from '../../hooks/useSocket';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Send, Image, X, ArrowLeft, Loader2, MoreVertical, Trash2, Ban, UserCheck, Flag } from 'lucide-react';
import toast from 'react-hot-toast';

export const ChatWindow = ({
  conversation,
  currentUserId,
  onBack,
  onConversationDeleted,
  onConversationUpdated,
  onRefreshConversations,
}) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingHideRef = useRef(null);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuBusy, setMenuBusy] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const otherParticipant = conversation?.participants?.find(
    p => String(p._id ?? p.id) !== String(currentUserId)
  );
  const otherIdRef = useRef(null);
  otherIdRef.current = otherParticipant?._id ?? otherParticipant?.id ?? null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages & join socket room
  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await chatService.getMessages(conversation._id);
        if (res.success && res.data) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        toast.error('Failed to load chat history.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    if (!socket) return;

    const convId = String(conversation._id);
    const joinRoom = () => socket.emit('join_conversation', conversation._id);

    // Join now, and re-join after any reconnect (rooms are lost when the socket drops)
    joinRoom();
    socket.on('connect', joinRoom);

    const onNewMessage = (newMsg) => {
      const msgConvId = String(newMsg.conversationId ?? newMsg.conversation ?? '');
      if (msgConvId !== convId) return;
      setIsTyping(false);
      setMessages((prev) => {
        const id = String(newMsg._id ?? newMsg.id);
        if (prev.some((m) => String(m._id ?? m.id) === id)) return prev; // de-dupe
        return [...prev, newMsg];
      });
    };
    const onTyping = ({ conversationId }) => {
      if (String(conversationId) !== convId) return;
      setIsTyping(true);
      // Safety net: hide indicator if the stop event is ever missed
      if (typingHideRef.current) clearTimeout(typingHideRef.current);
      typingHideRef.current = setTimeout(() => setIsTyping(false), 3500);
    };
    const onStopTyping = ({ conversationId }) => {
      if (String(conversationId) === convId) setIsTyping(false);
    };

    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onTyping);
    socket.on('user_stop_typing', onStopTyping);

    return () => {
      socket.emit('leave_conversation', conversation._id);
      socket.off('connect', joinRoom);
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onTyping);
      socket.off('user_stop_typing', onStopTyping);
      if (typingHideRef.current) clearTimeout(typingHideRef.current);
      setIsTyping(false);
    };
  }, [conversation?._id, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Close the 3-dot menu on outside click
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [menuOpen]);

  const REPORT_REASONS = [
    'Spam',
    'Harassment or bullying',
    'Inappropriate content',
    'Scam or fraud',
    'Fake account / impersonation',
    'Other',
  ];

  const handleDeleteChat = async () => {
    setMenuOpen(false);
    if (!window.confirm('Delete this chat? It will be removed from your messages.')) return;
    setMenuBusy(true);
    try {
      const res = await chatService.deleteConversation(conversation._id);
      if (res.success) {
        toast.success('Chat deleted.');
        if (onConversationDeleted) onConversationDeleted(conversation._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete chat.');
    } finally {
      setMenuBusy(false);
    }
  };

  const handleToggleBlock = async () => {
    setMenuOpen(false);
    const blocking = !conversation.isBlockedByMe;
    if (
      blocking &&
      !window.confirm(`Block ${otherParticipant?.name || 'this user'}? You won't be able to send or receive messages in this chat.`)
    ) {
      return;
    }
    setMenuBusy(true);
    try {
      const res = blocking
        ? await chatService.blockUser(conversation._id)
        : await chatService.unblockUser(conversation._id);
      if (res.success) {
        toast.success(blocking ? 'User blocked.' : 'User unblocked.');
        if (onConversationUpdated) {
          onConversationUpdated({
            ...conversation,
            isBlockedByMe: res.data.conversation.isBlockedByMe,
            isBlockedByOther: res.data.conversation.isBlockedByOther,
          });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setMenuBusy(false);
    }
  };

  const openReportModal = () => {
    setMenuOpen(false);
    setReportReason('');
    setReportDetails('');
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason) {
      toast.error('Please select a reason.');
      return;
    }
    setIsReporting(true);
    try {
      const res = await chatService.reportUser(conversation._id, reportReason, reportDetails);
      if (res.success) {
        toast.success(res.message || 'Report submitted.');
        setShowReportModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setIsReporting(false);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket && conversation?._id) {
      socket.emit('typing', { conversationId: conversation._id, recipientId: otherIdRef.current });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { conversationId: conversation._id, recipientId: otherIdRef.current });
      }, 1500);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !mediaFile) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      if (inputText.trim()) formData.append('text', inputText.trim());
      if (mediaFile) formData.append('media', mediaFile);
      if (otherParticipant?._id) formData.append('recipientId', otherParticipant._id);

      const res = await chatService.sendMessage(conversation._id, formData);
      if (res.success) {
        if (socket) socket.emit('stop_typing', { conversationId: conversation._id, recipientId: otherIdRef.current });
        setInputText('');
        handleRemoveImage();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
      // Probably blocked meanwhile - pull the latest block state
      if (err.response?.status === 403 && onRefreshConversations) onRefreshConversations();
    } finally {
      setIsSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-slate-400">
        <p className="text-sm font-medium">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Link
            to={`/profile/${otherParticipant?.username || otherParticipant?._id}`}
            className="flex items-center gap-2.5 group"
          >
            <Avatar src={otherParticipant?.avatar} size="md" isOrg={otherParticipant?.role === 'organization'} />
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors truncate">
                  {otherParticipant?.name}
                </h3>
                {otherParticipant?.role === 'organization' && (
                  <VerifiedOrgBadge isVerified={otherParticipant?.orgDetails?.isVerified} />
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {otherParticipant?.role === 'organization' ? 'Community Organization' : 'Volunteer'}
              </p>
            </div>
          </Link>
        </div>

        {/* 3-dot options menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            disabled={menuBusy}
            aria-label="Chat options"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center disabled:opacity-50"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 z-30 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 animate-fadeIn">
              <button
                type="button"
                onClick={handleDeleteChat}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete chat
              </button>
              <button
                type="button"
                onClick={handleToggleBlock}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {conversation.isBlockedByMe ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Unblock user
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    Block user
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={openReportModal}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Report user
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            Send a message to introduce yourself and coordinate community service drives!
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem
              key={msg._id ?? msg.id}
              message={msg}
              isMe={String(msg.sender?._id ?? msg.sender?.id ?? msg.sender ?? msg.senderId) === String(currentUserId)}
            />
          ))
        )}

        {isTyping && (
          <div className="text-xs text-slate-400 italic flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            <span>{otherParticipant?.name} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Media Preview if attached */}
      {mediaPreview && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600">
            <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900 text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xs text-slate-500 truncate">Image ready to send</span>
        </div>
      )}

      {/* Message Input Footer (replaced by a notice while blocked) */}
      {conversation.isBlockedByMe ? (
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/40">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You blocked this user. You can't send or receive messages.
          </p>
          <Button size="sm" variant="secondary" icon={UserCheck} onClick={handleToggleBlock} disabled={menuBusy}>
            Unblock
          </Button>
        </div>
      ) : conversation.isBlockedByOther ? (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40">
          You can't send messages in this conversation.
        </div>
      ) : (
      <form
        onSubmit={handleSend}
        className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        <label className="p-2.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors">
          <Image className="w-5 h-5" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </label>

        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={handleInputChange}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400"
        />

        <button
          type="submit"
          disabled={isSending || (!inputText.trim() && !mediaFile)}
          className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
      )}

      {/* Report modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title={`Report ${otherParticipant?.name || 'user'}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Admins will be able to read this conversation and take action. Choose the reason that fits best.
          </p>

          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                  reportReason === r
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={r}
                  checked={reportReason === r}
                  onChange={() => setReportReason(r)}
                  className="accent-rose-600"
                />
                {r}
              </label>
            ))}
          </div>

          <textarea
            rows="3"
            maxLength={500}
            placeholder="Add more details (optional)"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" icon={Flag} onClick={handleSubmitReport} isLoading={isReporting}>
              Submit report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
