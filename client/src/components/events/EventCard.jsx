import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryBadge, VerifiedOrgBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { formatDate } from '../../utils/dateUtils';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Star,
  ArrowRight,
} from 'lucide-react';

export const EventCard = ({ event }) => {
  const slotsRemaining = Math.max(0, (event.volunteerSlots || 0) - (event.registeredCount || 0));
  const progressPercent = Math.min(100, Math.round(((event.registeredCount || 0) / (event.volunteerSlots || 1)) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col h-full group">
      {/* Banner Image & Category */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={event.banner?.url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <CategoryBadge category={event.category} />
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 text-xs font-bold shadow-md">
            <Award className="w-3.5 h-3.5" />
            {event.hoursGranted} hrs
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Organizer */}
          <div className="flex items-center gap-2">
            <Avatar src={event.organizer?.avatar} size="xs" isOrg={true} />
            <Link
              to={`/profile/${event.organizer?.username || event.organizer?._id}`}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 truncate flex items-center gap-1"
            >
              <span>{event.organizer?.name}</span>
              <VerifiedOrgBadge isVerified={event.organizer?.orgDetails?.isVerified} />
            </Link>
          </div>

          {/* Title */}
          <Link to={`/events/${event._id}`}>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
              {event.title}
            </h3>
          </Link>

          {/* Description summary */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Date, Time & Location Details */}
          <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{event.location} ({event.locationType})</span>
            </div>
          </div>
        </div>

        {/* Progress bar & action footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Volunteer slots bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {slotsRemaining > 0 ? `${slotsRemaining} slots left` : 'Full capacity'}
              </span>
              <span>{event.registeredCount || 0} / {event.volunteerSlots} filled</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent >= 100 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {event.averageRating > 0 ? (
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{event.averageRating}</span>
                <span className="text-slate-400 font-normal">({event.totalRatings})</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400">New initiative</span>
            )}

            <Link
              to={`/events/${event._id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform"
            >
              <span>View & Apply</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
