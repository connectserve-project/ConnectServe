import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { trendingTags } from '../../data/homeMockData';

const tagColors = [
  'hover:text-emerald-600 dark:hover:text-emerald-400',
  'hover:text-violet-600 dark:hover:text-violet-400',
  'hover:text-electric-500',
  'hover:text-coral-500',
  'hover:text-pink-500',
  'hover:text-amber-500',
  'hover:text-teal-500',
];

export const TrendingSection = () => {
  return (
    <section className="flex flex-wrap items-center gap-x-5 gap-y-2 py-1">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
        <TrendingUp className="w-3.5 h-3.5" />
        Trending now
      </span>
      {trendingTags.map((tag, idx) => (
        <Link
          key={tag}
          to={`/explore?tag=${tag.replace('#', '')}`}
          className={`text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors ${tagColors[idx % tagColors.length]}`}
        >
          {tag}
        </Link>
      ))}
    </section>
  );
};
