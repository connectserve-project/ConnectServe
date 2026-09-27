import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { eventService } from '../services/eventService';
import { CategoryBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { AttendanceModal } from '../components/events/AttendanceModal';
import { formatDate } from '../utils/dateUtils';
import {
  Calendar,
  Users,
  Award,
  PlusCircle,
  Clock,
  Edit3,
  Trash2,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrgDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrgEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getEvents({ organizerId: user._id, limit: 50 });
      if (res.success && res.data) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      toast.error('Failed to load organization events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchOrgEvents();
    }
  }, [user?._id]);

  const handleDeleteEvent = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const res = await eventService.deleteEvent(id);
        if (res.success) {
          toast.success('Event deleted successfully.');
          setEvents(prev => prev.filter(e => e._id !== id));
        }
      } catch (err) {
        toast.error('Failed to delete event.');
      }
    }
  };

  const totalVolunteersEngaged = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
  const totalHoursDelivered = events.reduce((sum, e) => sum + (e.registeredCount * e.hoursGranted || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Organization Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your volunteering projects, review applicant rosters, and issue digital certificates.
          </p>
        </div>

        <Link to="/org/create-event">
          <Button variant="primary" size="md" icon={PlusCircle}>
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Hosted Events</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{events.length}</p>
          <p className="text-xs text-slate-400">Total community initiatives</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Volunteers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{totalVolunteersEngaged}</p>
          <p className="text-xs text-slate-400">Registered volunteer applications</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Impact Generated</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{totalHoursDelivered} hrs</p>
          <p className="text-xs text-slate-400">Total service hours awarded</p>
        </div>
      </div>

      {/* Events Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Active & Past Community Service Drives
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              You have not created any events yet.
            </p>
            <Link to="/org/create-event">
              <Button variant="primary" size="sm" icon={PlusCircle}>
                Host First Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Event Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Event Date</th>
                  <th className="px-4 py-3">Applicants / Slots</th>
                  <th className="px-4 py-3">Hours Credited</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map((evt) => (
                  <tr key={evt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      <Link to={`/events/${evt._id}`} className="hover:text-emerald-600">
                        {evt.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <CategoryBadge category={evt.category} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {formatDate(evt.date)}
                    </td>
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
                          onClick={() => handleDeleteEvent(evt._id, evt.title)}
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

      {/* Attendance & Applicants Manager Modal */}
      {selectedEventId && (
        <AttendanceModal
          isOpen={!!selectedEventId}
          onClose={() => setSelectedEventId(null)}
          eventId={selectedEventId}
          onUpdated={fetchOrgEvents}
        />
      )}
    </div>
  );
};
