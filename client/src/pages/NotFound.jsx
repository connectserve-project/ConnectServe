import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home, Compass } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-card space-y-5">
        <div className="text-6xl sm:text-7xl font-black text-emerald-600 dark:text-emerald-400">
          404
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            The page or resource you are looking for might have been moved, deleted, or does not exist.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/">
            <Button variant="primary" icon={Home} className="w-full sm:w-auto">
              Home
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="secondary" icon={Compass} className="w-full sm:w-auto">
              Browse Events
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
