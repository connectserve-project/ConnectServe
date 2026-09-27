import React from 'react';
import { Quote } from 'lucide-react';
import { testimonials } from '../../data/homeMockData';

const accents = ['border-emerald-200 dark:border-emerald-800/50', 'border-violet-200 dark:border-violet-800/50', 'border-coral-200 dark:border-coral-800/50'];
const quoteColors = ['text-emerald-500', 'text-violet-500', 'text-coral-500'];

export const TestimonialsSection = () => {
  return (
    <section className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Real people. Real communities.
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Stories from the Tricity
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((t, idx) => (
          <div
            key={t.id}
            className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border ${accents[idx % accents.length]} shadow-card space-y-4 hover-glow`}
          >
            <Quote className={`w-6 h-6 ${quoteColors[idx % quoteColors.length]}`} />
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{t.quote}</p>
            <div className="flex items-center gap-3 pt-1">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-9 h-9 rounded-full object-cover"
                loading="lazy"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{t.name}</p>
                <p className="text-[11px] text-slate-400">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
