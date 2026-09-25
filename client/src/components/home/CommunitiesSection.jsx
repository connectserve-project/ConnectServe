import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, CheckCircle2 } from 'lucide-react';
import { communities as mockCommunities } from '../../data/homeMockData';

const CommunityCard = ({ community }) => {
  const [joined, setJoined] = useState(false);
  const avatarUrl = community.avatar?.url || community.avatar || '';
  const coverUrl = community.banner?.url || community.cover || 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&auto=format&fit=crop&q=80';
  const category = community.orgDetails?.category || community.activity || 'Community NGO';
  const membersText = community.followersCount !== undefined
    ? `${community.followersCount || 12} followers`
    : `${community.members || '1.2K'} members`;

  const initials = community.name
    ? community.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'CS';

  const isVerified = community.orgDetails?.isVerified || community.verified;

  return (
    <div className="flex-shrink-0 w-[240px] sm:w-[260px] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-card hover-glow flex flex-col justify-between">
      <div>
        <div className="relative h-24 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
          <img
            src={coverUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          <div className="absolute -bottom-5 left-4 w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-white dark:border-slate-900 overflow-hidden flex items-center justify-center text-white font-extrabold text-xs shadow-md">
            {avatarUrl ? (
              <img src={avatarUrl} alt={community.name} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
        </div>

        <div className="pt-7 pb-3 px-4 space-y-2">
          <Link to={community._id ? `/profile/${community.username || community._id}` : '/explore'} className="block">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-1 hover:text-emerald-600 transition-colors flex items-center gap-1">
              <span>{community.name}</span>
              {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span>{membersText}</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium line-clamp-1">{category}</p>
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          onClick={() => setJoined((v) => !v)}
          className={`w-full text-xs font-bold py-2 rounded-xl transition-all ${
            joined
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/25 hover:shadow-lg'
          }`}
        >
          {joined ? 'Following ✓' : 'Follow NGO'}
        </button>
      </div>
    </div>
  );
};

export const CommunitiesSection = ({ liveOrganizations = [] }) => {
  const displayOrgs = liveOrganizations.length > 0 ? liveOrganizations : mockCommunities;

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Verified NGOs & Communities
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
            Partner with non-profits leading real social and environmental initiatives.
          </p>
        </div>
        <Link
          to="/communities"
          className="hidden sm:inline-flex flex-shrink-0 items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:translate-x-1 transition-transform"
        >
          <span>Explore all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="snap-rail gap-4 -mx-1 px-1 pb-1 no-scrollbar">
        {displayOrgs.map((c) => (
          <CommunityCard key={c._id || c.id} community={c} />
        ))}
      </div>
    </section>
  );
};
