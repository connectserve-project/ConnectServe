import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { chatService } from '../services/chatService';
import { eventService } from '../services/eventService';
import { Avatar } from '../components/common/Avatar';
import { VerifiedOrgBadge, AchievementBadge, RoleBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PostCard } from '../components/posts/PostCard';
import { CertificateCard } from '../components/certificates/CertificateCard';
import { CertificateViewerModal } from '../components/certificates/CertificateViewerModal';
import { QrCodeModal } from '../components/profile/QrCodeModal';
import {
  MapPin,
  Globe,
  Calendar,
  Clock,
  Award,
  Edit3,
  UserPlus,
  UserCheck,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Phone,
  GraduationCap,
  Hash,
  Plus,
  QrCode,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { idOrUsername } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [ngoEvents, setNgoEvents] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrToken, setQrToken] = useState('');

  const handleOpenQrModal = async () => {
    setQrModalOpen(true);
    if (!qrToken) {
      try {
        const res = await userService.getMyQrCode();
        if (res.success && res.data) {
          setQrToken(res.data.qrToken);
        }
      } catch (err) {
        toast.error('Failed to load QR code.');
      }
    }
  };

  const isOwnProfile =
    currentUser &&
    (profileUser?._id === currentUser._id || profileUser?.username === currentUser.username);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userService.getProfile(idOrUsername);
      if (res.success && res.data) {
        setProfileUser(res.data.user);
        setPosts(res.data.posts || []);
        setCertificates(res.data.certificates || []);
        setIsFollowing(res.data.isFollowing);
        setFollowersCount(res.data.user.followersCount || res.data.user.followers?.length || 0);
        
        if (res.data.user.role === 'organization') {
          const eventsRes = await eventService.getEvents({ organizerId: res.data.user._id, sortBy: 'date_asc' });
          if (eventsRes.success) {
            setNgoEvents(eventsRes.data.events || []);
          }
        }
      }
    } catch (err) {
      toast.error('Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [idOrUsername]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await userService.toggleFollow(profileUser._id);
      if (res.success) {
        setIsFollowing(res.data.isFollowing);
        setFollowersCount(prev => (res.data.isFollowing ? prev + 1 : Math.max(0, prev - 1)));
        toast.success(res.message);
      }
    } catch (err) {
      toast.error('Failed to update follow status.');
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await chatService.getOrCreateConversation(profileUser._id);
      if (res.success && res.data?.conversation) {
        navigate('/chat');
      }
    } catch (err) {
      toast.error('Failed to open chat.');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading user profile...</div>;
  }

  if (!profileUser) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Profile not found</h2>
        <Link to="/">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Cover & Avatar Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-card">
        {/* Banner */}
        <div className="h-44 sm:h-60 w-full overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
          <img
            src={profileUser.banner?.url || 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=1200&auto=format&fit=crop&q=80'}
            alt="Banner"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Profile Info Header */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="flex items-end gap-4">
              <Avatar
                src={profileUser.avatar}
                alt={profileUser.name}
                size="2xl"
                isOrg={profileUser.role === 'organization'}
                className="ring-4 ring-white dark:ring-slate-900"
              />
              <div className="pb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {profileUser.name}
                  </h1>
                  {profileUser.role === 'organization' && (
                    <VerifiedOrgBadge isVerified={profileUser.orgDetails?.isVerified} />
                  )}
                  <RoleBadge role={profileUser.role} />
                </div>
                {profileUser.email ? (
                  <p className="text-xs sm:text-sm text-slate-500">
                    {profileUser.email}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500">
                    @{profileUser.username || 'user'}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <div className="flex items-center gap-2">
                  {profileUser.role === 'user' && (
                    <Button variant="primary" size="sm" icon={QrCode} onClick={handleOpenQrModal}>
                      My QR Code
                    </Button>
                  )}
                  <Link to="/settings/profile">
                    <Button variant="secondary" size="sm" icon={Edit3}>
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Button
                    variant={isFollowing ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={handleToggleFollow}
                    icon={isFollowing ? UserCheck : UserPlus}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartChat}
                    icon={MessageSquare}
                  >
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Bio & Details */}
          <div className="space-y-4 max-w-3xl">
            {profileUser.bio && (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {profileUser.bio}
              </p>
            )}

            {profileUser.role === 'organization' && profileUser.orgDetails?.mission && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-900 dark:text-emerald-200">
                <strong>Our Mission:</strong> {profileUser.orgDetails.mission}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              {profileUser.gender && (
                <span className="flex items-center gap-1 capitalize">
                  <span className="text-emerald-600">⚥</span> {profileUser.gender}
                </span>
              )}
              {profileUser.institution && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> {profileUser.institution}
                </span>
              )}
              {profileUser.mobileNumber && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {profileUser.countryCode} {profileUser.mobileNumber}
                </span>
              )}
              {profileUser.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {[profileUser.location, profileUser.state, profileUser.country].filter(Boolean).join(', ')}
                  {profileUser.pincode && ` – ${profileUser.pincode}`}
                </span>
              )}
              {!profileUser.location && (profileUser.state || profileUser.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {[profileUser.state, profileUser.country].filter(Boolean).join(', ')}
                  {profileUser.pincode && ` – ${profileUser.pincode}`}
                </span>
              )}
              {profileUser.socialLinks?.website && (
                <a
                  href={profileUser.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-emerald-600 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined {new Date(profileUser.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Followers / Following counts & Volunteer hours */}
            <div className="flex items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <strong className="font-bold text-slate-900 dark:text-white mr-1">
                  {followersCount}
                </strong>
                <span className="text-slate-500">Followers</span>
              </div>
              <div>
                <strong className="font-bold text-slate-900 dark:text-white mr-1">
                  {profileUser.followingCount || profileUser.following?.length || 0}
                </strong>
                <span className="text-slate-500">Following</span>
              </div>

              {profileUser.role === 'user' && (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm ml-auto">
                  <Clock className="w-4 h-4" />
                  <span>{profileUser.volunteerHours || 0} Volunteer Hours</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Gamification Showcase (For Volunteers) */}
      {profileUser.role === 'user' && profileUser.badges && profileUser.badges.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            Earned Achievement Badges ({profileUser.badges.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {profileUser.badges.map((badge, idx) => (
              <AchievementBadge key={idx} badge={badge} size="lg" />
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition-colors min-h-[44px] ${
              activeTab === 'posts'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Community Posts ({posts.length})
          </button>

          {profileUser.role === 'organization' && (
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition-colors min-h-[44px] ${
                activeTab === 'events'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Events ({ngoEvents.length})
            </button>
          )}

          {isOwnProfile && profileUser.role === 'user' && (
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition-colors min-h-[44px] ${
                activeTab === 'certificates'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Digital Certificates ({certificates.length})
            </button>
          )}
        </div>

        {isOwnProfile && profileUser.role === 'organization' && activeTab === 'events' && (
          <Link
            to="/org/create-event"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </Link>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === 'posts' && (
        <div className="max-w-2xl mx-auto space-y-4">
          {posts.length === 0 ? (
            <p className="text-center py-12 text-xs text-slate-400">
              No community posts shared yet.
            </p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={(id) => setPosts(prev => prev.filter(p => p._id !== id))}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'events' && profileUser.role === 'organization' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ngoEvents.length === 0 ? (
            <p className="sm:col-span-2 text-center py-12 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
              No upcoming events yet.
            </p>
          ) : (
            ngoEvents.map((event) => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-card transition-shadow space-y-2"
              >
                <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{event.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {isOwnProfile && activeTab === 'certificates' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {certificates.length === 0 ? (
            <div className="sm:col-span-2 text-center py-12 text-xs text-slate-400">
              No certificates earned yet. Attend community drives to receive official awards!
            </div>
          ) : (
            certificates.map((cert) => (
              <CertificateCard
                key={cert._id}
                certificate={cert}
                onView={(c) => setSelectedCert(c)}
              />
            ))
          )}
        </div>
      )}

      {/* Certificate Previewer Modal */}
      <CertificateViewerModal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        certificate={selectedCert}
      />

      {/* Volunteer QR Code Modal */}
      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        user={profileUser}
        qrToken={qrToken}
      />
    </div>
  );
};
