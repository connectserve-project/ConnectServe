import React from 'react';
import { formatTimeAgo } from '../../utils/dateUtils';

export const MessageItem = ({ message, isMe }) => {
  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} my-1.5`}>
      <div
        className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm ${
          isMe
            ? 'bg-emerald-600 text-white rounded-tr-none'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
        }`}
      >
        {message.media?.url && (
          <div className="rounded-xl overflow-hidden mb-2 max-h-48">
            <img src={message.media.url} alt="Attachment" className="w-full h-full object-cover" />
          </div>
        )}
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
      </div>
      <span className="text-[10px] text-slate-400 mt-1 px-1">
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};
