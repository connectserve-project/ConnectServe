import React from 'react';
import { Link } from 'react-router-dom';
import { Image, Video, Calendar, HeartHandshake, BarChart3, HelpCircle, Sparkles } from 'lucide-react';
import { PostCard } from '../posts/PostCard';

const composerActions = [
  { label: 'Photo', icon: Image, color: 'text-emerald-600' },
  { label: 'Video', icon: Video, color: 'text-electric-500' },
  { label: 'Event', icon: Calendar, color: 'text-violet-600' },
  { label: 'Service', icon: HeartHandshake, color: 'text-coral-500' },
  { label: 'Poll', icon: BarChart3, color: 'text-amber-500' },
  { label: 'Ask', icon: HelpCircle, color: 'text-pink-500' },
];

export const FeedSection = ({ livePosts = [] }) => {
  return (
    <section className="space-y-5 w-full">
      <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
        What's happening around you?
      </h2>


      {/* Posts */}
      {livePosts.length > 0 ? (
        <div className="space-y-4">
          {livePosts.map((post) => (
            <PostCard key={post._id || post.id} post={post} hideActions />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center gap-2 py-10 px-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Sparkles className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No community posts yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
            Be the first to share an update, event, or ask for help.
          </p>
        </div>
      )}

      <div className="text-center pt-1">
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:translate-x-0.5 transition-transform"
        >
          Explore all community posts →
        </Link>
      </div>
    </section>
  );
};
