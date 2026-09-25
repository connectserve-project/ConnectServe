import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, Shield, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                CS
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                ConnectServe
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              The unified Social Media & Community Service Management System empowering volunteers, verified NGOs, and passionate organizers worldwide.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
              <Sparkles className="w-4 h-4" />
              <span>Connect. Volunteer. Impact.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Explore
            </h5>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/events" className="hover:text-emerald-600 transition-colors">
                  Volunteering Events
                </Link>
              </li>
              <li>
                <Link to="/feed" className="hover:text-emerald-600 transition-colors">
                  Community Feed
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-emerald-600 transition-colors">
                  Top Volunteers
                </Link>
              </li>
            </ul>
          </div>

          {/* Roles & Verification */}
          <div className="space-y-3">
            <h5 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Get Involved
            </h5>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/register" className="hover:text-emerald-600 transition-colors">
                  Register as Volunteer
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-600 transition-colors">
                  Register NGO / Organization
                </Link>
              </li>
              <li>
                <Link to="/certificates" className="hover:text-emerald-600 transition-colors">
                  Verify Certificates
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ConnectServe Platform. Built for real community impact.</p>
        </div>
      </div>
    </footer>
  );
};
