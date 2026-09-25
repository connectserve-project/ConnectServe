import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { useSocket } from '../hooks/useSocket';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { formatTimeAgo } from '../utils/dateUtils';
import {
  Bell,
  CheckCheck,
  Award,
  Heart,
  MessageCircle,
  UserPlus,
  Calendar,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotificationsCount } = useSocket();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(1);
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadNotificationsCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadNotificationsCount(0);
        toast.success('All notifications marked as read.');
      }
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif._id);
        setNotifications(prev =>
          prev.map(n => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        // ignore
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'certificate_issued':
      case 'hours_logged':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'event_registered':
      case 'event_approved':
        return <Calendar className="w-4 h-4 text-teal-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-emerald-600" />
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time updates on your event applications, certificate awards, and social interactions.
          </p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            icon={CheckCheck}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-card">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">
              No notifications yet
            </h3>
            <p className="text-xs text-slate-400">
              We'll notify you when volunteers apply, events update, or friends interact with your posts.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((n) => (
              <Link
                key={n._id}
                to={n.link || '#'}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 rounded-2xl flex items-start gap-3.5 transition-colors block ${
                  !n.isRead
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="relative">
                  <Avatar src={n.sender?.avatar} size="md" />
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-slate-900 shadow">
                    {getNotificationIcon(n.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <h4 className={`text-xs sm:text-sm font-bold ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {n.message}
                  </p>
                </div>

                {!n.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
