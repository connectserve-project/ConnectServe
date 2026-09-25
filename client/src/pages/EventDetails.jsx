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
} from 'lucide-react';
import toast from 'react-hot-toast';

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
        <img
          src={event.banner?.url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&auto=format&fit=crop&q=80'}
          alt={event.title}
          className="w-full h-80 sm:h-96 object-cover opacity-80"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-10">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
            <div className="flex items-center gap-2.5 p-2">
              <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Date</p>
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {formatDate(event.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2">
              <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Time</p>
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {event.time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2">
              <Award className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Hours Granted</p>
                <p className="font-extrabold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 truncate">
                  {event.hoursGranted} Verified hrs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2">
              <Users className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Open Slots</p>
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
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

          {/* Event Posts Section */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Event Posts
            </h3>
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id || post._id} post={post} onUpdate={fetchEventData} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No posts about this event yet. Be the first to share your experience!</p>
            )}
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
