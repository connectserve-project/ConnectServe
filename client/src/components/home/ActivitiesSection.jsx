import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarX } from 'lucide-react';
import { EventCard } from '../events/EventCard';

export const ActivitiesSection = ({ liveEvents = [] }) => {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Get involved nearby.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real activities, organized by real people and organizations near you.
          </p>
        </div>
        <Link
          to="/events"
          className="hidden sm:inline-flex flex-shrink-0 items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:translate-x-1 transition-transform"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {liveEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {liveEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center gap-2 py-10 px-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <CalendarX className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No events nearby yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
            Check back soon, or create the first event in your community.
          </p>
        </div>
      )}
    </section>
  );
};
