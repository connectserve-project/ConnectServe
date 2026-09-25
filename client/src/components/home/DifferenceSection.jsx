import React from 'react';
import { Eye, UserPlus, Footprints, Share2, Sparkles, Heart, MessageCircle } from 'lucide-react';

const flowSteps = [
  { icon: Eye, label: 'See a post', color: 'from-emerald-500 to-teal-500' },
  { icon: UserPlus, label: 'Join', color: 'from-teal-500 to-cyan-500' },
  { icon: Footprints, label: 'Take action', color: 'from-cyan-500 to-electric-500' },
  { icon: Share2, label: 'Share', color: 'from-violet-500 to-purple-500' },
  { icon: Sparkles, label: 'Inspire', color: 'from-coral-500 to-amber-400' },
];

export const DifferenceSection = () => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-slate-900 dark:bg-slate-950 text-white p-6 sm:p-12 lg:p-14 border border-slate-800">
      <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3 mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">The ConnectServe difference</span>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight">
          Your action becomes a story.
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          Online conversation. Real-world action. Social sharing. All in one loop.
        </p>
      </div>

      {/* Flow */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
        {flowSteps.map((step, idx) => (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-200">{step.label}</span>
            </div>
            {idx < flowSteps.length - 1 && (
              <span className="hidden sm:block text-slate-600 text-xl -mt-6">→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Example resulting post */}
      <div className="relative z-10 max-w-md mx-auto bg-slate-800/70 backdrop-blur-md rounded-3xl p-5 border border-slate-700 shadow-2xl animate-fadeInUp">
        <div className="flex items-center gap-3 mb-3">
          <img
            src="https://i.pravatar.cc/150?img=32"
            alt=""
            className="w-9 h-9 rounded-full object-cover"
            loading="lazy"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="font-bold text-sm text-white">Simran Kaur</p>
            <p className="text-[11px] text-slate-400">New Chandigarh · Just now</p>
          </div>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed mb-4">
          "Joined 24 people for a cleanup today. We collected 18 bags of waste. 🌱"
        </p>
        <div className="flex items-center gap-5 text-slate-400 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 fill-rose-500 stroke-rose-500" /> 184 likes</span>
          <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> 26 comments</span>
          <span className="flex items-center gap-1.5"><Share2 className="w-4 h-4" /> 12 shares</span>
        </div>
      </div>

      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
    </section>
  );
};
