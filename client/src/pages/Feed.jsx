import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { postService } from '../services/postService';
import { eventService } from '../services/eventService';
import { userService } from '../services/userService';
import { PostCard } from '../components/posts/PostCard';
import { PostCardSkeleton } from '../components/common/Skeleton';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Tabs } from '../components/common/Tabs';
import { CategoryBadge, VerifiedOrgBadge } from '../components/common/Badge';
import {
  Image,
  Sparkles,
  Calendar,
  Trophy,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Globe,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Feed = ({ onOpenCreatePost }) => {
  const { user, isAuthenticated, isOrganization } = useAuth();
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeScope = searchParams.get('tab') === 'following' ? 'following' : 'all';

  const [posts, setPosts] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [topVolunteers, setTopVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFeed = async (pageNum = 1, scope = activeScope) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await postService.getFeed(pageNum, 8, scope);
      if (res.success && res.data) {
        if (pageNum === 1) {
          setPosts(res.data.posts || []);
        } else {
          setPosts(prev => [...prev, ...(res.data.posts || [])]);
        }
        setHasMore(res.data.hasMore);
      }
    } catch (err) {
      toast.error('Failed to load feed.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchFeed(1, activeScope);
  }, [activeScope]);

  useEffect(() => {
    // Fetch sidebar widgets
    const fetchWidgets = async () => {
      try {
        const [eventsRes, leaderRes] = await Promise.all([
          eventService.getEvents({ limit: 3, sortBy: 'date_asc' }),
          userService.getLeaderboard('all'),
        ]);
        if (eventsRes.success) setRecommendedEvents(eventsRes.data.events || []);
        if (leaderRes.success) setTopVolunteers((leaderRes.data.volunteers || []).slice(0, 4));
      } catch (err) {
        // ignore
      }
    };
    fetchWidgets();
  }, []);

  // Listen to new public posts over socket
  useEffect(() => {
    if (socket) {
      socket.on('new_public_post', (newPost) => {
        if (activeScope === 'all') {
          setPosts(prev => {
            if (prev.some(p => p._id === newPost._id)) return prev;
            return [newPost, ...prev];
          });
        }
      });
    }
    return () => {
      if (socket) socket.off('new_public_post');
    };
  }, [socket, activeScope]);

  const handlePostDeleted = (deletedId) => {
    setPosts(prev => prev.filter(p => p._id !== deletedId));
  };

  const handleTabChange = (newTab) => {
    setSearchParams(newTab === 'following' ? { tab: 'following' } : {});
  };

  const tabsConfig = [
    { id: 'all', label: 'All Feed', icon: Globe },
    ...(isAuthenticated ? [{ id: 'following', label: 'Following', icon: Users }] : []),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
      {/* Main Feed Column */}
      <main className="lg:col-span-8 space-y-4">
        {/* Feed Header with Sub-Tabs */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-card">
          <Tabs
            tabs={tabsConfig}
            activeTab={activeScope}
            onChange={handleTabChange}
          />
        </div>

        {/* Quick Post Composer Card */}
        {isAuthenticated && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-card flex items-center gap-3">
            <Avatar src={user?.avatar} size="md" isOrg={user?.role === 'organization'} />
            <button
              onClick={onOpenCreatePost}
              className="flex-1 text-left px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors focus:outline-none min-h-[44px]"
            >
              {isOrganization
                ? 'Announce an update or cause milestone...'
                : 'Share your volunteering journey or project highlights...'}
            </button>
            <button
              onClick={onOpenCreatePost}
              className="p-2.5 rounded-2xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Upload photo post"
            >
              <Image className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <Sparkles className="w-12 h-12 text-emerald-500 mx-auto" />
            {activeScope === 'following' ? (
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  No Posts From Followed Volunteers/Organisations
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                  You're not following anyone yet — follow Volunteers or Organisations to see their posts here.
                </p>
                <div className="mt-4 flex justify-center">
                  <Link to="/leaderboard">
                    <Button variant="primary" size="sm" icon={Users}>
                      Discover Volunteers
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Your Feed is Quiet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Follow fellow volunteers and organizations or publish your very first post to see community updates here.
                </p>
                <div className="mt-4 flex justify-center">
                  <Button variant="primary" size="sm" onClick={onOpenCreatePost}>
                    Create First Post
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={handlePostDeleted}
              />
            ))}

            {hasMore && (
              <div className="pt-2 text-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchFeed(next, activeScope);
                  }}
                  isLoading={loadingMore}
                >
                  Load Older Posts
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Right Sidebar Widgets */}
      <aside className="hidden lg:block lg:col-span-4 space-y-6">
        {/* Recommended Upcoming Drives */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Upcoming Drives
            </h3>
            <Link
              to="/events"
              className="text-[11px] font-bold text-emerald-600 hover:underline"
            >
              See All
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedEvents.map((evt) => (
              <Link
                key={evt._id}
                to={`/events/${evt._id}`}
                className="block p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <CategoryBadge category={evt.category} className="mb-1.5" />
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                  {evt.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  {new Date(evt.date).toLocaleDateString()} • {evt.hoursGranted} hrs
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Community Volunteers Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Top Volunteers
            </h3>
            <Link
              to="/leaderboard"
              className="text-[11px] font-bold text-emerald-600 hover:underline"
            >
              Leaderboard
            </Link>
          </div>

          <div className="space-y-3">
            {topVolunteers.map((vol) => (
              <Link
                key={vol._id}
                to={`/profile/${vol.username || vol._id}`}
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={vol.avatar} size="sm" />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {vol.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      @{vol.username || 'volunteer'}
                    </p>
                  </div>
                </div>
                <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  {vol.volunteerHours || 0} hrs
                </span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
