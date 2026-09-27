import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/common/Avatar';
import { VerifiedOrgBadge } from '../components/common/Badge';
import { PostCard } from '../components/posts/PostCard';
import {
  Search,
  Users,
  ArrowLeft,
  Building2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const NGO_LIMIT = 12;

const OrgCard = ({ org, onSelect, onToggleFollow, followBusy }) => {
  const avatarUrl = org.avatar?.url || org.avatar || '';
  const bannerUrl =
    org.banner?.url ||
    org.banner ||
    'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&auto=format&fit=crop&q=80';
  const category = org.orgDetails?.category || 'Community NGO';
  const followersCount = org.followers?.length ?? org.followersCount ?? 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-card hover-glow flex flex-col">
      <div className="relative h-24 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img
          src={bannerUrl}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute -bottom-5 left-4">
          <Avatar src={avatarUrl} alt={org.name} size="lg" isOrg className="border-2 border-white dark:border-slate-900" />
        </div>
      </div>

      <div className="pt-8 pb-3 px-4 space-y-1.5 flex-1">
        <button onClick={() => onSelect(org)} className="text-left w-full">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-1 hover:text-emerald-600 transition-colors flex items-center gap-1">
            <span className="truncate">{org.name}</span>
            <VerifiedOrgBadge isVerified={org.orgDetails?.isVerified} className="hidden" />
            {org.orgDetails?.isVerified && (
              <span className="text-emerald-500 flex-shrink-0">✓</span>
            )}
          </h3>
        </button>
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Users className="w-3.5 h-3.5" />
          <span>{followersCount} followers</span>
        </div>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium line-clamp-1">
          {category}
        </p>
        {org.bio && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-1">{org.bio}</p>
        )}
      </div>

      <div className="p-4 pt-0 flex gap-2">
        <button
          onClick={() => onSelect(org)}
          className="flex-1 text-xs font-bold py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          View Posts
        </button>
        <button
          onClick={() => onToggleFollow(org)}
          disabled={followBusy}
          className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-60 ${
            org.isFollowedByMe
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/25 hover:shadow-lg'
          }`}
        >
          {org.isFollowedByMe ? 'Following ✓' : 'Follow'}
        </button>
      </div>
    </div>
  );
};

export const Communities = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [followBusyId, setFollowBusyId] = useState(null);

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgPosts, setOrgPosts] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);

  const fetchOrgs = useCallback(async (pageNum, q) => {
    setLoading(true);
    try {
      const res = await userService.searchUsers({
        role: 'organization',
        q: q || undefined,
        page: pageNum,
        limit: NGO_LIMIT,
      });
      if (res.success) {
        setOrgs(res.data?.users || []);
        setPages(res.data?.pages || 1);
      }
    } catch (err) {
      toast.error('Failed to load NGOs & communities.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgs(page, search);
  }, [page, fetchOrgs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams(search ? { q: search } : {});
    fetchOrgs(1, search);
  };

  const handleSelectOrg = async (org) => {
    setSelectedOrg(org);
    setOrgLoading(true);
    setOrgPosts([]);
    try {
      const res = await userService.getProfile(org.username || org._id);
      if (res.success) {
        setSelectedOrg(res.data?.user || org);
        setOrgPosts(res.data?.posts || []);
      }
    } catch (err) {
      toast.error('Failed to load this community\u2019s posts.');
    } finally {
      setOrgLoading(false);
    }
  };

  const handleToggleFollow = async (org) => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow NGOs.');
      return;
    }
    setFollowBusyId(org._id);
    try {
      const res = await userService.toggleFollow(org._id);
      if (res.success) {
        setOrgs((prev) =>
          prev.map((o) =>
            o._id === org._id ? { ...o, isFollowedByMe: !o.isFollowedByMe } : o
          )
        );
        if (selectedOrg?._id === org._id) {
          setSelectedOrg((prev) => ({ ...prev, isFollowedByMe: !prev.isFollowedByMe }));
        }
      }
    } catch (err) {
      toast.error('Could not update follow status.');
    } finally {
      setFollowBusyId(null);
    }
  };

  // ---- Detail view: a single NGO's posts ----
  if (selectedOrg) {
    return (
      <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedOrg(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all NGOs & Communities
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card flex items-center gap-4">
          <Avatar src={selectedOrg.avatar} alt={selectedOrg.name} size="xl" isOrg />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              {selectedOrg.name}
              <VerifiedOrgBadge isVerified={selectedOrg.orgDetails?.isVerified} />
            </h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {selectedOrg.orgDetails?.category || 'Community NGO'}
            </p>
            {selectedOrg.bio && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{selectedOrg.bio}</p>
            )}
          </div>
          <button
            onClick={() => handleToggleFollow(selectedOrg)}
            disabled={followBusyId === selectedOrg._id}
            className={`flex-shrink-0 text-xs font-bold px-4 py-2.5 rounded-xl transition-all disabled:opacity-60 ${
              selectedOrg.isFollowedByMe
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/25 hover:shadow-lg'
            }`}
          >
            {selectedOrg.isFollowedByMe ? 'Following ✓' : 'Follow NGO'}
          </button>
        </div>

        <div className="space-y-4">
          {orgLoading ? (
            <div className="py-12 flex items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading posts...
            </div>
          ) : orgPosts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-2">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-base text-slate-700 dark:text-slate-200">No posts yet</h4>
              <p className="text-xs text-slate-400">This community hasn't shared any updates yet.</p>
            </div>
          ) : (
            orgPosts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </div>
      </div>
    );
  }

  // ---- Directory view: all NGOs / communities ----
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Building2 className="w-4 h-4" /> Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            NGOs & Communities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse every verified NGO and community on ConnectServe, follow the ones you care about, and see their latest posts.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search NGOs or communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        </form>
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading NGOs & communities...
        </div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-base text-slate-700 dark:text-slate-200">No NGOs found</h4>
          <p className="text-xs text-slate-400">Try a different search term.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgs.map((org) => (
              <OrgCard
                key={org._id}
                org={org}
                onSelect={handleSelectOrg}
                onToggleFollow={handleToggleFollow}
                followBusy={followBusyId === org._id}
              />
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-slate-500">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
