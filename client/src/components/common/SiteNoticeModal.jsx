import React, { useEffect, useState } from 'react';
import { GraduationCap, Globe, AlertTriangle, X } from 'lucide-react';

const STORAGE_KEY = 'connectserve_notice_seen';

// Pop-up shown when someone opens the website (once per browser session).
export const SiteNoticeModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (_) { /* storage blocked - just show the notice */ }
    if (!seen) setOpen(true);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (_) { /* ignore */ }
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-notice-title"
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 id="site-notice-title" className="text-lg font-extrabold text-slate-900 dark:text-white">
            Important Notice
          </h2>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          <span className="font-semibold text-slate-900 dark:text-white">ConnectServe</span> is a{' '}
          <span className="font-semibold text-emerald-600">college project</span>. Please keep the
          following in mind while using the website:
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5">
            <Globe className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <span className="font-bold text-slate-900 dark:text-white">connectserve.in</span> is
                available only until <span className="font-semibold">9 September 2027</span>.
              </p>
              <p className="mt-1.5">
                <span className="font-bold text-slate-900 dark:text-white">connectserve.onrender.com</span>{' '}
                will remain active as the permanent address.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
              The website may be taken down in some cases, so please don&apos;t rely on it as your only
              place to store important information.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={close}
          className="w-full min-h-[44px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};
