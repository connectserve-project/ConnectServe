import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, CheckCircle2, Building2 } from 'lucide-react';

// The User model's default banner is a placeholder stock photo - never show it.
const DEFAULT_BANNER_MARK = 'photo-1579208575657-c595a05383b7';

const CommunityCard = ({ community }) => {
  const [joined, setJoined] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const avatarUrl = community.avatar?.url || community.avatar || '';
  const rawBanner = community.banner?.url || (typeof community.banner === 'string' ? community.banner : '') || community.cover || '';
  const coverUrl = rawBanner && !rawBanner.includes(DEFAULT_BANNER_MARK) ? rawBanner : '';
  const showCover = Boolean(coverUrl) && !coverFailed;
  const category = community.orgDetails?.category || community.activity || 'Community NGO';

  const initials = community.name
    ? community.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'CS';

  const isVerified = community.orgDetails?.isVerified || community.verified;

  return (
    <div className="flex-shrink-0 w-[240px] sm:w-[260px] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-card hover-glow flex flex-col justify-between">
      <div>
        <div className="relative h-24 w-full">
          {/* Clip only the cover image */}
          <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-emerald-700 to-teal-600">
            {showCover && (
              <img
                src={coverUrl}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setCoverFailed(true)}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Avatar sits outside the clipped area, so it shows fully */}
          <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-900 overflow-hidden flex items-center justify-center shadow-md z-10">
            {avatarUrl ? (
              <img src={avatarUrl} alt={community.name} className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold text-xs">
                {initials}
              </span>
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
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium line-clamp-1">{category}</p>
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          onClick={() => setJoined((v) => !v)}
          className={`w-full text-xs font-bold py-2 rounded-xl transition-all ${joined
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

      {liveOrganizations.length > 0 ? (
        <div className="snap-rail gap-4 -mx-1 px-1 pb-1 no-scrollbar">
          {liveOrganizations.map((c) => (
            <CommunityCard key={c._id || c.id} community={c} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center gap-2 py-10 px-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Building2 className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No verified NGOs yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
            Verified organizations will appear here once Admin approves their accounts.
          </p>
        </div>
      )}
    </section>
  );
};
