import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Clock, MapPin } from 'lucide-react';
import { EventCard } from '../events/EventCard';
import { nearbyActivities } from '../../data/homeMockData';

const DemoActivityCard = ({ activity }) => (
  <Link
    to="/events"
    className="flex-shrink-0 w-[240px] sm:w-[260px] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-card hover-glow group"
  >
    <div className="relative h-32 w-full overflow-hidden">
      <img
        src={activity.image}
        alt={activity.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${activity.accent} shadow-md`}>
        {activity.category}
      </div>
    </div>
    <div className="p-4 space-y-2">
      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{activity.title}</h3>
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <Clock className="w-3.5 h-3.5" />
        <span>{activity.when}</span>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5" /> {activity.location}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          <Users className="w-3.5 h-3.5" /> {activity.joined} joined
        </span>
      </div>
    </div>
  </Link>
);

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
        <div className="snap-rail gap-4 -mx-1 px-1 pb-1 no-scrollbar">
          {nearbyActivities.map((activity) => (
            <DemoActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </section>
  );
};
