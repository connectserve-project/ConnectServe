import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../common/Avatar';
import { VerifiedOrgBadge, AchievementBadge } from '../common/Badge';
import {
  Home,
  Compass,
  Building2,
  Calendar,
  Trophy,
  Award,
  MessageSquare,
  Bell,
  LayoutDashboard,
  Shield,
  User,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ onOpenCreatePost, className = '' }) => {
  const { user, isAuthenticated, isOrganization, isAdmin } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 min-h-[44px] ${
      isActive
        ? 'bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 text-white shadow-lg shadow-teal-600/30 font-bold scale-[1.02]'
        : 'text-slate-600 dark:text-slate-300 hover:bg-teal-50/70 dark:hover:bg-slate-800/80 hover:text-teal-700 dark:hover:text-teal-300 hover:translate-x-0.5'
    }`;

  return (
    <aside className={`w-64 flex-shrink-0 space-y-6 ${className}`}>
      {/* User Mini Profile Card (if authenticated) */}
      {isAuthenticated && user && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} alt={user.name} size="lg" isOrg={user.role === 'organization'} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {user.name}
                </h4>
                {user.role === 'organization' && (
                  <VerifiedOrgBadge isVerified={user.orgDetails?.isVerified} />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                @{user.username || 'user'}
              </p>
            </div>
          </div>

          {/* Volunteer hours or NGO info */}
          {user.role === 'user' ? (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Service Hours
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  {user.volunteerHours || 0} hrs
                </span>
              </div>
              {user.badges && user.badges.length > 0 && (
                <div className="pt-1">
                  <p className="text-[11px] text-slate-400 font-medium mb-1">Top Badge:</p>
                  <AchievementBadge badge={user.badges[user.badges.length - 1]} size="sm" />
                </div>
              )}
            </div>
          ) : user.role === 'organization' ? (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <p className="font-medium text-slate-700 dark:text-slate-300">Mission:</p>
              <p className="line-clamp-2 mt-0.5">{user.orgDetails?.mission || 'Community Service Organizer'}</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-card space-y-1">
        <NavLink to="/feed" className={navLinkClass}>
          <Home className="w-5 h-5" />
          <span>Home Feed</span>
        </NavLink>

        <NavLink to="/events" className={navLinkClass}>
          <Calendar className="w-5 h-5" />
          <span>Community Events</span>
        </NavLink>

        <NavLink to="/communities" className={navLinkClass}>
          <Building2 className="w-5 h-5" />
          <span>NGOs & Communities</span>
        </NavLink>

        <NavLink to="/leaderboard" className={navLinkClass}>
          <Trophy className="w-5 h-5" />
          <span>Leaderboard</span>
        </NavLink>

        {isAuthenticated && user?.role === 'user' && (
          <NavLink to="/certificates" className={navLinkClass}>
            <Award className="w-5 h-5" />
            <span>My Certificates</span>
          </NavLink>
        )}

        {isAuthenticated && isOrganization && (
          <NavLink to="/org/dashboard" className={navLinkClass}>
            <LayoutDashboard className="w-5 h-5 text-emerald-500" />
            <span>Org Dashboard</span>
          </NavLink>
        )}

        {isAuthenticated && isAdmin && (
          <NavLink to="/admin" className={navLinkClass}>
            <Shield className="w-5 h-5 text-purple-500" />
            <span>Admin Center</span>
          </NavLink>
        )}

        {isAuthenticated && (
          <>
            <NavLink to="/chat" className={navLinkClass}>
              <MessageSquare className="w-5 h-5" />
              <span>Direct Messages</span>
            </NavLink>

            <NavLink to="/notifications" className={navLinkClass}>
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </NavLink>

            <NavLink to={`/profile/${user.username || user._id}`} className={navLinkClass}>
              <User className="w-5 h-5" />
              <span>My Profile</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Quick Action Button for Volunteer Posts */}
      {isAuthenticated && !isOrganization && !isAdmin && (
        <button
          onClick={onOpenCreatePost}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-teal-500/25 hover:shadow-indigo-500/30 active:scale-[0.98] transition-all min-h-[44px]"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Share Volunteer Story</span>
        </button>
      )}
    </aside>
  );
};
