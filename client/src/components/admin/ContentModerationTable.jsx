import React, { useState } from 'react';
import { Button } from '../common/Button';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/dateUtils';
import { Flag, Trash2, CheckCircle, AlertTriangle, MessageSquare, ChevronDown, ChevronUp, Ban, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContentModerationTable = ({ reports = [], onReportResolved }) => {
  const [resolvingId, setResolvingId] = useState(null);
  const [openChatId, setOpenChatId] = useState(null);
  const [chatLoadingId, setChatLoadingId] = useState(null);
  const [chats, setChats] = useState({}); // reportId -> { messages, reportedUserId }

  const toggleChat = async (reportId) => {
    if (openChatId === reportId) {
      setOpenChatId(null);
      return;
    }
    setOpenChatId(reportId);
    if (chats[reportId]) return;
    setChatLoadingId(reportId);
    try {
      const res = await adminService.getReportMessages(reportId);
      if (res.success) setChats((prev) => ({ ...prev, [reportId]: res.data }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load chat.');
      setOpenChatId(null);
    } finally {
      setChatLoadingId(null);
    }
  };

  const handleAction = async (reportId, action) => {
    if (action === 'ban_user' && !window.confirm('Ban this user? They will no longer be able to log in.')) return;
    setResolvingId(reportId);
    try {
      const res = await adminService.resolveReport(reportId, action);
      if (res.success) {
        const messages = {
          delete_target: 'Content removed.',
          warn_user: 'Warning sent to the user.',
          ban_user: 'User banned.',
        };
        toast.success(messages[action] || 'Report dismissed.');
        if (onReportResolved) onReportResolved();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process moderation action.');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
      <div>
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Content Moderation Queue
        </h3>
        <p className="text-xs text-slate-500">
          Review community reports on posts, comments and user chats
        </p>
      </div>

      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">All clear!</p>
            <p>No pending flagged content in moderation queue.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report._id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                    {report.reason}
                  </span>
                  <span className="text-xs text-slate-500">
                    Reported on {formatDate(report.createdAt)} by {report.reporter?.name || 'Anonymous'}
                  </span>
                </div>

                {report.conversationId && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-700 dark:text-slate-200">
                      <span className="font-bold">Reported user:</span>{' '}
                      {report.target?.name || 'Deleted user'}
                      {report.target?.username ? ` (@${report.target.username})` : ''}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleChat(report._id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {openChatId === report._id ? 'Hide chat' : 'View chat messages'}
                      {openChatId === report._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {openChatId === report._id && (
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 max-h-72 overflow-y-auto space-y-2">
                        {chatLoadingId === report._id ? (
                          <div className="py-4 flex justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                          </div>
                        ) : (chats[report._id]?.messages || []).length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-3">No messages in this chat.</p>
                        ) : (
                          chats[report._id].messages.map((m) => {
                            const isReported = String(m.senderId ?? m.sender?.id) === String(chats[report._id].reportedUserId);
                            return (
                              <div
                                key={m._id ?? m.id}
                                className={`p-2 rounded-lg text-xs ${
                                  isReported
                                    ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900'
                                    : 'bg-slate-50 dark:bg-slate-800'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className={`font-bold ${isReported ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {m.sender?.name || 'User'}{isReported ? ' (reported)' : ''}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(m.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-200 break-words">{m.text}</p>
                                {m.media?.url && (
                                  <a href={m.media.url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                                    View attachment
                                  </a>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!report.conversationId && (report.target ? (
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200">
                    <p className="font-bold text-[11px] text-slate-400 mb-1">Flagged Content:</p>
                    <p className="italic">{report.target.content || report.target.title || 'Attached Media/User'}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Target item already deleted</p>
                ))}

                {report.details && (
                  <p className="text-xs text-slate-500">Note: {report.details}</p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={resolvingId === report._id}
                  onClick={() => handleAction(report._id, 'dismiss')}
                >
                  Dismiss
                </Button>
                {report.conversationId ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={resolvingId === report._id}
                      onClick={() => handleAction(report._id, 'warn_user')}
                      icon={AlertTriangle}
                    >
                      Warn User
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={resolvingId === report._id}
                      onClick={() => handleAction(report._id, 'ban_user')}
                      icon={Ban}
                    >
                      Ban User
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={resolvingId === report._id}
                    onClick={() => handleAction(report._id, 'delete_target')}
                    icon={Trash2}
                  >
                    Remove Content
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
