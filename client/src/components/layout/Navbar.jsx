import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useSocket } from '../../hooks/useSocket';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import {
  Sun,
  Moon,
  Bell,
  MessageSquare,
  Search,
  PlusCircle,
  LogOut,
  User as UserIcon,
  Award,
  Calendar,
  LayoutDashboard,
  Shield,
  Menu,
  X,
} from 'lucide-react';

export const Navbar = ({ onOpenCreatePost, onToggleMobileSidebar }) => {
  const { user, isAuthenticated, logout, isOrganization, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadNotificationsCount } = useSocket();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none min-h-[40px] min-w-[40px] flex items-center justify-center flex-shrink-0"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  <path d="M19 11l2 2 4-4"></path>
                </svg>
              </div>
              <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 dark:from-teal-400 dark:via-emerald-400 dark:to-indigo-400 bg-clip-text text-transparent">
                ConnectServe
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search events, volunteers, causes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            </form>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Create Post / Create Event Button (desktop only) */}
                {isOrganization ? (
                  <Link to="/org/create-event" className="hidden md:inline-flex">
                    <Button variant="primary" size="sm" icon={PlusCircle}>
                      Create Event
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={onOpenCreatePost}
                    variant="primary"
                    size="sm"
                    icon={PlusCircle}
                    className="hidden md:inline-flex"
                  >
                    Post Update
                  </Button>
                )}

                {/* Direct Messages (hide on small mobile since it's on bottom bar) */}
                <Link
                  to="/chat"
                  className={`hidden sm:flex relative p-1.5 sm:p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[38px] min-w-[38px] items-center justify-center ${
                    location.pathname === '/chat' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600' : ''
                  }`}
                  aria-label="Messages"
                >
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>

                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className={`relative p-1.5 sm:p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
                    location.pathname === '/notifications' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600' : ''
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-emerald-500 transition-all focus:outline-none min-h-[38px] min-w-[38px]"
                  >
                    <Avatar src={user.avatar} alt={user.name} size="sm" isOrg={user.role === 'organization'} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fadeIn">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          @{user.username || user.email.split('@')[0]}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            {user.role === 'organization' ? '🏢 NGO / Organizer' : user.role === 'admin' ? '🛡️ Admin' : `🌱 ${user.volunteerHours || 0} hrs logged`}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Links */}
                      <div className="py-1">
                        <Link
                          to={`/profile/${user.username || user._id}`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>My Profile</span>
                        </Link>

                        {user.role === 'user' && (
                          <Link
                            to="/certificates"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Award className="w-4 h-4 text-amber-500" />
                            <span>My Certificates</span>
                          </Link>
                        )}

                        {isOrganization && (
                          <Link
                            to="/org/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                            <span>Organization Dashboard</span>
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-purple-600" />
                            <span>Admin Center</span>
                          </Link>
                        )}

                        <Link
                          to="/events"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>Browse Events</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Join Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
