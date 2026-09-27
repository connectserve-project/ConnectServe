import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { EventCard } from '../components/events/EventCard';
import { EventFilter } from '../components/events/EventFilter';
import { EventCardSkeleton } from '../components/common/Skeleton';
import { Calendar, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [locationType, setLocationType] = useState('all');
  const [sortBy, setSortBy] = useState('date_asc');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        category: category !== 'All' ? category : undefined,
        locationType: locationType !== 'all' ? locationType : undefined,
        sortBy,
        limit: 18,
      };

      const res = await eventService.getEvents(params);
      if (res.success && res.data) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, locationType, sortBy, search]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Opportunities Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Community Volunteering Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover Events, sign up to earn verified hours, and help causes you care about.
          </p>
        </div>
      </div>

      {/* Filter Component */}
      <EventFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        locationType={locationType}
        setLocationType={setLocationType}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Events Fluid Responsive Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No events match your filter
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Try choosing a different cause category, location filter, or resetting your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard key={evt._id} event={evt} />
          ))}
        </div>
      )}
    </div>
  );
};
