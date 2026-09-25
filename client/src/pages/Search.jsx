import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { eventService } from '../services/eventService';
import { PostCard } from '../components/posts/PostCard';
import { EventCard } from '../components/events/EventCard';
import { Avatar } from '../components/common/Avatar';
import { VerifiedOrgBadge } from '../components/common/Badge';
import { Search as SearchIcon, Users, Building2, Calendar, Rss, Loader2, SearchX } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'people', label: 'Volunteers' },
  { key: 'ngos', label: 'NGOs' },
  { key: 'events', label: 'Events' },
  { key: 'posts', label: 'Posts' }
];

const PersonCard = ({ person }) => {
  const isOrg = person.role === 'organization';
  const category = person.orgDetails?.category;

  return (
    <Link
      to={`/profile/${person.username || person.id}`}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card hover-glow p-4 flex items-center gap-3"
    >
      <Avatar src={person.avatar?.url || person.avatar} alt={person.name} size="lg" isOrg={isOrg} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{person.name}</h3>
          {isOrg && person.orgDetails?.isVerified && <VerifiedOrgBadge isVerified className="hidden" />}
          {isOrg && person.orgDetails?.isVerified && <span className="text-emerald-500 text-xs">✓</span>}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {isOrg ? category || 'Organization' : `@${person.username}`}
        </p>
      </div>
    </Link>
  );
};

export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';
  const effectiveQuery = query || tag;

  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [volunteers, setVolunteers] = useState(['people']);
  const [ngos, setNgos] = useState(['ngos']);
  const [events, setEvents] = useState(['events']);
  const [posts, setPosts] = useState(['posts']);

  // Volunteers & NGOs: always fetched (default listing when no query, filtered results when searching)
  const loadPeople = useCallback(async () => {
    try {
      const baseParams = effectiveQuery ? { q: effectiveQuery, limit: 12 } : { limit: 12 };

      const [volunteersRes, ngosRes] = await Promise.allSettled([
        userService.searchUsers({ ...baseParams, role: 'user' }),
        userService.searchUsers({ ...baseParams, role: 'organization' }),
      ]);

      setVolunteers(volunteersRes.status === 'fulfilled' ? volunteersRes.value?.data?.users || [] : []);
      setNgos(ngosRes.status === 'fulfilled' ? ngosRes.value?.data?.users || [] : []);
    } catch (err) {
      toast.error('Failed to load volunteers & NGOs.');
    }
  }, [effectiveQuery]);

  // Events & Posts: default listing when no query, filtered results when searching
  const loadSearchOnly = useCallback(async () => {
    try {
      const eventParams = effectiveQuery ? { search: effectiveQuery, limit: 12 } : { limit: 12 };
      const postParams = effectiveQuery ? { search: effectiveQuery, limit: 12 } : { limit: 12 };

      const [eventsRes, postsRes] = await Promise.allSettled([
        eventService.getEvents(eventParams),
        postService.getExplore(postParams),
      ]);

      setEvents(eventsRes.status === 'fulfilled' ? eventsRes.value?.data?.events || [] : []);
      setPosts(postsRes.status === 'fulfilled' ? postsRes.value?.data?.posts || [] : []);
    } catch (err) {
      toast.error('Search failed. Please try again.');
    }
  }, [effectiveQuery]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadPeople(), loadSearchOnly()]);
      setLoading(false);
    })();
  }, [loadPeople, loadSearchOnly]);

  const totalResults = volunteers.length + ngos.length + events.length + posts.length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {effectiveQuery ? `Results for "${effectiveQuery}"` : 'Explore ConnectServe'}
        </h1>
        {!loading && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {effectiveQuery
              ? `${totalResults} result${totalResults === 1 ? '' : 's'} found across volunteers, NGOs, events and posts.`
              : 'Discover volunteers and NGOs from the community. '}
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap border-b border-slate-200 dark:border-slate-800 pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              activeTab === t.key
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      )}

      {!loading && totalResults === 0 && (
        <div className="text-center py-20 text-slate-400">
          <SearchX className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            {effectiveQuery
              ? `No results for "${effectiveQuery}". Try a different keyword.`
              : 'Nothing to show yet. Check back soon!'}
          </p>
        </div>
      )}

      {!loading && totalResults > 0 && (
        <div className="space-y-8">
          {(activeTab === 'all' || activeTab === 'people') && volunteers.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Users className="w-4 h-4" /> Volunteers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {volunteers.map((p) => (
                  <PersonCard key={p.id} person={p} />
                ))}
              </div>
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'ngos') && ngos.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Building2 className="w-4 h-4" /> NGOs
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ngos.map((p) => (
                  <PersonCard key={p.id} person={p} />
                ))}
              </div>
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'events') && events.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Calendar className="w-4 h-4" /> Events
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Rss className="w-4 h-4" /> Posts
              </h2>
              <div className="space-y-4 max-w-2xl">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
