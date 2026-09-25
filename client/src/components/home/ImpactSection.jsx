import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';

const gradients = ['text-gradient-ocean', 'text-gradient-berry', 'text-gradient-sunset', 'text-gradient-ocean'];

const StatBlock = ({ stat, gradientClass }) => {
  const [ref, value] = useCountUp(stat.value);
  return (
    <div ref={ref} className="text-center space-y-1">
      <p className={`font-display text-3xl sm:text-5xl font-extrabold ${gradientClass}`}>
        {value.toLocaleString()}
        {stat.suffix}
      </p>
      <p className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wide">{stat.label}</p>
    </div>
  );
};

const StatSkeleton = () => (
  <div className="text-center space-y-2 animate-pulse">
    <div className="h-9 sm:h-12 w-20 sm:w-28 mx-auto rounded-lg bg-white/10" />
    <div className="h-3 w-16 mx-auto rounded bg-white/10" />
  </div>
);

export const ImpactSection = ({ liveStats }) => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-slate-900 dark:bg-black p-8 sm:p-14 text-white">
      {/* Abstract map-inspired background dots */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="none">
        <defs>
          <pattern id="dot-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
      <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-xl mx-auto mb-10 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Impact</span>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold">Small actions. Visible impact.</h2>
      </div>

      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {liveStats
          ? liveStats.map((stat, idx) => (
              <StatBlock key={stat.label} stat={stat} gradientClass={gradients[idx % gradients.length]} />
            ))
          : Array.from({ length: 4 }).map((_, idx) => <StatSkeleton key={idx} />)}
      </div>
    </section>
  );
};
