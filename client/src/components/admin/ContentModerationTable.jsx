import React, { useState } from 'react';
import { Button } from '../common/Button';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/dateUtils';
import { Flag, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContentModerationTable = ({ reports = [], onReportResolved }) => {
  const [resolvingId, setResolvingId] = useState(null);

  const handleAction = async (reportId, action) => {
    setResolvingId(reportId);
    try {
      const res = await adminService.resolveReport(reportId, action);
      if (res.success) {
        toast.success(action === 'delete_target' ? 'Content removed.' : 'Report dismissed.');
        if (onReportResolved) onReportResolved();
      }
    } catch (err) {
      toast.error('Failed to process moderation action.');
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
          Review community reports on inappropriate posts or spam
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

                {report.target ? (
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200">
                    <p className="font-bold text-[11px] text-slate-400 mb-1">Flagged Content:</p>
                    <p className="italic">{report.target.content || report.target.title || 'Attached Media/User'}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Target item already deleted</p>
                )}

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
                <Button
                  size="sm"
                  variant="danger"
                  disabled={resolvingId === report._id}
                  onClick={() => handleAction(report._id, 'delete_target')}
                  icon={Trash2}
                >
                  Remove Content
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
