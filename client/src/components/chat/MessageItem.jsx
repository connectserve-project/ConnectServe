import React from 'react';
import { FileText, Download } from 'lucide-react';

const formatFileSize = (bytes = 0) => {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

// Cloudinary video -> H.264 MP4 so every browser can play it
const playableVideoUrl = (url) => {
  if (!url || url.startsWith('data:') || !url.includes('/video/upload/')) return url;
  return url
    .replace('/video/upload/', '/video/upload/f_mp4,vc_h264,q_auto/')
    .replace(/\.[a-z0-9]+$/i, '.mp4');
};

const Attachment = ({ media, isMe }) => {
  if (!media?.url) return null;
  const type = media.type || 'image'; // old messages have no type -> they were images

  if (type === 'video') {
    return (
      <div className="rounded-xl overflow-hidden mb-2 bg-black">
        <video src={playableVideoUrl(media.url)} controls preload="metadata" className="w-full max-h-72" />
      </div>
    );
  }

  if (type === 'document') {
    return (
      <a
        href={media.url}
        target="_blank"
        rel="noopener noreferrer"
        download={media.name}
        className={`flex items-center gap-3 rounded-xl p-3 mb-2 transition-colors ${
          isMe ? 'bg-emerald-700/60 hover:bg-emerald-700' : 'bg-white/70 dark:bg-slate-700/60 hover:bg-white dark:hover:bg-slate-700'
        }`}
      >
        <FileText className="w-8 h-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold truncate">{media.name || 'Document'}</p>
          {media.size ? <p className="text-[10px] opacity-70">{formatFileSize(media.size)}</p> : null}
        </div>
        <Download className="w-4 h-4 shrink-0 opacity-80" />
      </a>
    );
  }

  return (
    <a href={media.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden mb-2 max-h-72">
      <img src={media.url} alt="Attachment" className="w-full h-full object-cover" />
    </a>
  );
};

export const MessageItem = ({ message, isMe }) => {
  const isAutoText =
    message.media?.url && ['📷 Photo', '🎥 Video', 'Sent an attachment'].includes(message.text);
  const isDocAutoText = message.media?.type === 'document' && message.text === `📄 ${message.media.name}`;

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} my-1.5`}>
      <div
        className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm ${
          isMe
            ? 'bg-emerald-600 text-white rounded-tr-none'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
        }`}
      >
        <Attachment media={message.media} isMe={isMe} />
        {!(isAutoText || isDocAutoText) && (
          <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
        )}
      </div>
      <span className="text-[10px] text-slate-400 mt-1 px-1">
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};
