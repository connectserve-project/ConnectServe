import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { eventService } from '../services/eventService';
import { chatService } from '../services/chatService';
import { postService } from '../services/postService';
import { Avatar } from '../components/common/Avatar';
import { PostCard } from '../components/posts/PostCard';
import { CategoryBadge, VerifiedOrgBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ReviewModal } from '../components/events/ReviewModal';
import { formatDate } from '../utils/dateUtils';
import { FeedVideo, isVideoMedia } from '../components/common/FeedVideo';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  CheckCircle2,
  Share2,
  MessageSquare,
  Star,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// An event is "done" once its end date (or, if none, the end of its start day) has passed
const getEventEndTime = (event) => {
  const base = new Date(event.endDate || event.date);
  if (isNaN(base)) return null;
  const end = new Date(base);
  end.setHours(23, 59, 59, 999);
  return end;
};

const formatDateRange = (start, end) => {
  const opts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const s = new Date(start);
  if (!end) return s.toLocaleDateString('en-US', opts);
  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) return s.toLocaleDateString('en-US', opts);
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`;
};

export const EventDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isVolunteer, isOrganization } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applyNotes, setApplyNotes] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchEventData = async () => {
    setLoading(true);
    try {
      const res = await eventService.getEventById(id);
      if (res.success && res.data) {
        setEvent(res.data.event);
        setUserRegistration(res.data.userRegistration);
        setReviews(res.data.reviews || []);
      }
      const postsRes = await postService.getExplore({ eventId: id, limit: 10 });
      if (postsRes.success && postsRes.data) {
        setPosts(postsRes.data.posts || []);
      }
    } catch (err) {
      toast.error('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role === 'admin') {
      toast.error("Admins can't volunteer for events.");
      return;
    }
    if (user?.role === 'organization') {
      toast.error("Can't Join Others Events");
      return;
    }

    setIsApplying(true);
    try {
      const res = await eventService.registerForEvent(id, applyNotes);
      if (res.success) {
        toast.success(res.message || 'Application submitted successfully!');
        setUserRegistration(res.data.registration);
        setShowApplyModal(false);
        setApplyNotes('');
        fetchEventData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply for event.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleStartChatWithOrganizer = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await chatService.getOrCreateConversation(event.organizer._id);
      if (res.success && res.data?.conversation) {
        navigate('/chat');
      }
    } catch (err) {
      toast.error('Failed to open chat.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 animate-pulse">
        Loading event details...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Event not found</h2>
        <Link to="/events">
          <Button variant="primary">Return to Events</Button>
        </Link>
      </div>
    );
  }

  const slotsRemaining = Math.max(0, (event.volunteerSlots || 0) - (event.registeredCount || 0));
  const isOrganizer = user && event.organizer?._id === user._id;
  const isAdminUser = user?.role === 'admin';
  const eventEnd = getEventEndTime(event);
  const isEventDone =
    event.status === 'completed' ||
    event.status === 'cancelled' ||
    (eventEnd && eventEnd < new Date());

  const handleAdminDeleteEvent = async () => {
    if (!window.confirm(`Delete event "${event.title}"? This removes all its registrations and cannot be undone.`)) return;
    try {
      const res = await eventService.deleteEvent(event._id);
      if (res.success) {
        toast.success('Event deleted.');
        navigate('/events');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Back Button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all events</span>
      </Link>

      {/* Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[440px]">
        {isVideoMedia(event.banner) ? (
          <FeedVideo src={event.banner.url} className="w-full h-80 sm:h-96" />
        ) : (
          <img
            src={event.banner?.url || 'https://res.cloudinary.com/os27otij/image/upload/v1790353591/connectserve/profiles/tn1by19pxjdlrzb8odxa.png'}
            alt={event.title}
            className="w-full h-80 sm:h-96 object-cover opacity-80"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-10 ${isVideoMedia(event.banner) ? 'pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <CategoryBadge category={event.category} />
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
              {event.locationType.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Grid: Details + Registration Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Info Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Key Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
            <div className="flex items-start gap-3 p-2">
              <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">
                  {event.endDate ? 'Dates' : 'Date'}
                </p>
                <p className="font-bold text-sm text-slate-900 dark:text-white break-words">
                  {formatDateRange(event.date, event.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2">
              <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Time</p>
                <p className="font-bold text-sm text-slate-900 dark:text-white break-words">
                  {event.time}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2">
              <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Hours Granted</p>
                <p className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 break-words">
                  {event.hoursGranted} Verified hrs
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2">
              <Users className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Open Slots</p>
                <p className="font-bold text-sm text-slate-900 dark:text-white break-words">
                  {slotsRemaining} / {event.volunteerSlots}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              About This Initiative
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Requirements & Skills Needed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {event.requirements && event.requirements.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Event Requirements
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {event.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.skillsNeeded && event.skillsNeeded.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Helpful Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {event.skillsNeeded.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Volunteer Reviews Section */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Volunteer Feedback & Ratings
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  {event.averageRating > 0 ? (
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span>{event.averageRating} out of 5.0</span>
                      <span className="text-slate-400 font-normal">({event.totalRatings} reviews)</span>
                    </div>
                  ) : (
                    <span>No reviews yet</span>
                  )}
                </div>
              </div>

              {userRegistration && (userRegistration.status === 'approved' || userRegistration.status === 'attended') && !userRegistration.reviewGiven && (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Star}
                  onClick={() => setShowReviewModal(true)}
                >
                  Write Review
                </Button>
              )}
            </div>

            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              {reviews.map((rev) => (
                <div key={rev._id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar src={rev.user?.avatar} size="xs" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {rev.user?.name}
                      </span>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Action & Organizer Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Registration Status / Action Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Volunteer Registration
            </h3>

            {userRegistration ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Your Application Status:
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      userRegistration.status === 'attended'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : userRegistration.status === 'approved'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : userRegistration.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {userRegistration.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {userRegistration.status === 'attended'
                    ? '✓ Attendance verified! Your digital certificate has been issued.'
                    : userRegistration.status === 'approved'
                    ? '🎉 Your spot is confirmed! The organizer will expect you on event day.'
                    : userRegistration.status === 'pending'
                    ? 'Your application is awaiting organizer review.'
                    : 'Your registration could not be accommodated.'}
                </p>
              </div>
            ) : isOrganizer ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                You are the organizer of this event. Manage applicants from your Organizer Dashboard.
              </div>
            ) : isEventDone ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-bold text-center">
                Event is done, can't join.
              </div>
            ) : isOrganization ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-bold text-center">
                Can't Join Others Events
              </div>
            ) : isAdminUser ? (
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium text-center">
                Admins can't volunteer for events.
              </div>
            ) : slotsRemaining === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-800 dark:text-amber-300 font-semibold text-center">
                All volunteer slots are currently filled.
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setShowApplyModal(true)}
              >
                Apply to Volunteer
              </Button>
            )}

            {isAdminUser && (
              <button
                type="button"
                onClick={handleAdminDeleteEvent}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Event (Admin)
              </button>
            )}

            <div className="pt-2 text-xs text-slate-500 space-y-1">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {event.location}
              </p>
            </div>
          </div>

          {/* Organizer Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Organized By
            </h4>
            <div className="flex items-start gap-3">
              <Avatar src={event.organizer?.avatar} size="lg" isOrg={true} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {event.organizer?.name}
                  </h3>
                  <VerifiedOrgBadge isVerified={event.organizer?.orgDetails?.isVerified} />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {event.organizer?.bio || event.organizer?.orgDetails?.mission}
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                to={`/profile/${event.organizer?.username || event.organizer?._id}`}
                className="flex-1"
              >
                <Button variant="secondary" size="sm" className="w-full">
                  View Profile
                </Button>
              </Link>

              {user?._id !== event.organizer?._id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartChatWithOrganizer}
                  icon={MessageSquare}
                >
                  Contact
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Apply to Volunteer: {event.title}
            </h3>
            <p className="text-xs text-slate-500">
              Let the organizer know about your relevant experience or any questions:
            </p>
            <textarea
              rows="4"
              placeholder="e.g. Excited to help! I have prior experience with tree planting and first aid..."
              value={applyNotes}
              onChange={(e) => setApplyNotes(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApply}
                isLoading={isApplying}
              >
                Confirm Application
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        eventId={event._id}
        onReviewSubmitted={() => fetchEventData()}
      />
    </div>
  );
};
