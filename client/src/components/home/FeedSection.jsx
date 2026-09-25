import React from 'react';
import { Link } from 'react-router-dom';
import { Image, Video, Calendar, HeartHandshake, BarChart3, HelpCircle } from 'lucide-react';
import { PostCard } from '../posts/PostCard';
import { feedPosts as mockFeedPosts } from '../../data/homeMockData';

const composerActions = [
  { label: 'Photo', icon: Image, color: 'text-emerald-600' },
  { label: 'Video', icon: Video, color: 'text-electric-500' },
  { label: 'Event', icon: Calendar, color: 'text-violet-600' },
  { label: 'Service', icon: HeartHandshake, color: 'text-coral-500' },
  { label: 'Poll', icon: BarChart3, color: 'text-amber-500' },
  { label: 'Ask', icon: HelpCircle, color: 'text-pink-500' },
];

export const FeedSection = ({ livePosts = [] }) => {
  const displayPosts = livePosts.length > 0 ? livePosts : mockFeedPosts;

  return (
    <section className="space-y-5 w-full">
      <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
        What's happening around you?
      </h2>


      {/* Posts */}
      <div className="space-y-4">
        {displayPosts.map((post) => (
          <PostCard key={post._id || post.id} post={post} hideActions />
        ))}
      </div>

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
