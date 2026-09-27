import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { VerifiedOrgBadge } from '../common/Badge';
import { MessageItem } from './MessageItem';
import { chatService } from '../../services/chatService';
import { useSocket } from '../../hooks/useSocket';
import { Send, Image, X, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ChatWindow = ({
  conversation,
  currentUserId,
  onBack,
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

  const otherParticipant = conversation?.participants?.find(
    p => p._id !== currentUserId
  );

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

    if (socket) {
      socket.emit('join_conversation', conversation._id);

      socket.on('new_message', (newMsg) => {
        if (newMsg.conversation === conversation._id) {
          setMessages(prev => [...prev, newMsg]);
        }
      });

      socket.on('user_typing', ({ conversationId }) => {
        if (conversationId === conversation._id) {
          setIsTyping(true);
        }
      });

      socket.on('user_stop_typing', ({ conversationId }) => {
        if (conversationId === conversation._id) {
          setIsTyping(false);
        }
      });
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', conversation._id);
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
      }
    };
  }, [conversation?._id, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket && conversation?._id) {
      socket.emit('typing', { conversationId: conversation._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { conversationId: conversation._id });
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
        setInputText('');
        handleRemoveImage();
      }
    } catch (err) {
      toast.error('Failed to send message.');
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
              key={msg._id}
              message={msg}
              isMe={msg.sender?._id === currentUserId || msg.sender === currentUserId}
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

      {/* Message Input Footer */}
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
    </div>
  );
};
