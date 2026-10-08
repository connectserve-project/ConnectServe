import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { CategoryBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { AttendanceModal } from '../events/AttendanceModal';
import { formatDate } from '../../utils/dateUtils';
import { Calendar, Users, Award, PlusCircle, Edit3, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminEventsTable = ({ events = [], onEventsChanged }) => {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.organizer?.name?.toLowerCase().includes(q)
    );
  }, [events, query]);

  const totalVolunteers = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
  const totalHours = events.reduce(
    (sum, e) => sum + (e.registeredCount || 0) * (e.hoursGranted || 0),
    0
  );

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await eventService.deleteEvent(id);
      if (res.success) {
        toast.success('Event deleted successfully.');
        onEventsChanged?.();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + create */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="font-bold text-base text-slate-900 dark:text-white">
           Manage All Community Service Events Of Platform
        </p>
        <Link to="/create-event">
          <Button variant="primary" size="md" icon={PlusCircle}>
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Events</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{events.length}</p>
          <p className="text-xs text-slate-400">Community initiatives on the platform</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Volunteers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{totalVolunteers}</p>
          <p className="text-xs text-slate-400">Registered volunteer applications</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Impact Generated</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{totalHours} hrs</p>
          <p className="text-xs text-slate-400">Total service hours awarded</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            All Community Service Events
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, category, organizer..."
              className="pl-9 pr-3 py-2 w-full sm:w-72 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No events have been created yet.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No events match "{query}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Event Title</th>
                  <th className="px-4 py-3">Organizer</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Event Date</th>
                  <th className="px-4 py-3">Applicants / Slots</th>
                  <th className="px-4 py-3">Hours Credited</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((evt) => (
                  <tr key={evt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      <Link to={`/events/${evt._id}`} className="hover:text-emerald-600">
                        {evt.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {evt.organizer?.name || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <CategoryBadge category={evt.category} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(evt.date)}</td>
                    <td className="px-4 py-3.5 font-semibold">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {evt.registeredCount || 0}
                      </span>{' '}
                      / {evt.volunteerSlots}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">
                      {evt.hoursGranted} hrs
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setSelectedEventId(evt._id)}
                          icon={Users}
                        >
                          Manage Applicants
                        </Button>

                        <Link to={`/org/events/${evt._id}/edit`}>
                          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </Link>

                        <button
                          onClick={() => handleDelete(evt._id, evt.title)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEventId && (
        <AttendanceModal
          isOpen={!!selectedEventId}
          onClose={() => setSelectedEventId(null)}
          eventId={selectedEventId}
          onUpdated={onEventsChanged}
        />
      )}
    </div>
  );
};
