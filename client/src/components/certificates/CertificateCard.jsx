import React from 'react';
import { Award, Calendar, Clock, CheckCircle2, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { Button } from '../common/Button';

export const CertificateCard = ({ certificate, onView }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-4 group">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Certificate
          </span>
          <span className="font-mono text-xs text-slate-400 font-medium">
            {certificate.certificateCode}
          </span>
        </div>

        {/* Certificate Title & Event */}
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
            {certificate.badgeAwarded || 'Certificate of Appreciation'}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 line-clamp-1">
            {certificate.eventTitle || certificate.event?.title}
          </p>
        </div>

        {/* Details grid */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Awarded To:</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">{certificate.volunteerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Issued By:</span>
            <span className="font-medium">{certificate.organizationName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" /> Hours Credited:
            </span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              {certificate.hours} Hours
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Issue Date:
            </span>
            <span>{formatDate(certificate.issueDate)}</span>
          </div>
        </div>
      </div>

      {/* Button */}
      <Button
        variant="primary"
        size="sm"
        onClick={() => onView(certificate)}
        icon={Download}
        className="w-full"
      >
        View & Download PDF
      </Button>
    </div>
  );
};
