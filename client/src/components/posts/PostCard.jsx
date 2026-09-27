import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../common/Avatar';
import { VerifiedOrgBadge, RoleBadge } from '../common/Badge';
import { CommentList } from './CommentList';
import { ShareModal } from './ShareModal';
import { formatTimeAgo } from '../../utils/dateUtils';
import { postService } from '../../services/postService';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Flag,
  Calendar,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PostCard = ({ post, onPostDeleted, hideActions = false }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const initialLikes = Array.isArray(post.likes) ? post.likes : Array.from({ length: typeof post.likes === 'number' ? post.likes : 0 });
  const [likes, setLikes] = useState(initialLikes);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isLiked = user ? likes.some(id => (typeof id === 'object' ? id._id === user._id : id === user._id)) : false;
  const isAuthor = user && post.author?._id === user._id;

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like posts.');
      return;
    }
    if (isLiking) return;

    // Optimistic UI update
    const previousLikes = [...likes];
    if (isLiked) {
      setLikes(likes.filter(id => (typeof id === 'object' ? id._id !== user._id : id !== user._id)));
    } else {
      setLikes([...likes, user._id]);
    }

    setIsLiking(true);
    try {
      const res = await postService.toggleLike(post._id);
      if (!res.success) {
        setLikes(previousLikes);
      }
    } catch (err) {
      setLikes(previousLikes);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const res = await postService.deletePost(post._id);
        if (res.success) {
          toast.success('Post removed.');
          if (onPostDeleted) onPostDeleted(post._id);
        }
      } catch (err) {
        toast.error('Failed to delete post.');
      }
    }
  };

  const handleReport = async () => {
    const reason = prompt('Please enter the reason for reporting this post:');
    if (reason) {
      try {
        await postService.reportPost(post._id, 'inappropriate_content', reason);
        toast.success('Thank you. Post submitted to moderation team.');
      } catch (err) {
        toast.error('Failed to report post.');
      }
    }
  };

  return (
    <article className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author?.username || post.author?._id}`}>
            <Avatar
              src={post.author?.avatar}
              alt={post.author?.name}
              size="md"
              isOrg={post.author?.role === 'organization'}
            />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/profile/${post.author?.username || post.author?._id}`}
                className="font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {post.author?.name}
              </Link>
              {post.author?.role === 'organization' && (
                <VerifiedOrgBadge isVerified={post.author?.orgDetails?.isVerified} />
              )}
              <RoleBadge role={post.author?.role || 'user'} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{formatTimeAgo(post.createdAt)}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-20 animate-fadeIn">
              {(isAuthor || isAdmin) && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Post</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleReport();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-medium"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report Content</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content text */}
      <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed break-words">
        {post.content}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag, idx) => (
            <Link
              key={idx}
              to={`/explore?tag=${tag}`}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Tagged Event banner */}
      {post.eventTag && (
        <Link
          to={`/events/${post.eventTag._id || post.eventTag.id}`}
          className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
            <img
              src={post.eventTag.banner?.url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=150&auto=format&fit=crop&q=80'}
              alt={post.eventTag.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Linked Community Event
            </span>
            <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {post.eventTag.title}
            </h5>
          </div>
        </Link>
      )}

      {/* Image Media (Cloudinary responsive) */}
      {post.media?.url && post.media.mediaType === 'image' && (
        <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-[500px]">
          <img
            src={post.media.url}
            alt="Post attachment"
            className="w-full h-auto max-h-[500px] object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Engagement Action Bar */}
      {!hideActions && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all min-h-[44px] ${
              isLiked
                ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 font-bold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-600 stroke-rose-600 scale-110' : ''} transition-transform`} />
            <span>{likes.length}</span>
          </button>

          {/* Comment Drawer Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] ${
              showComments ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>{commentsCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      )}

      {/* Comments section */}
      {!hideActions && showComments && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <CommentList
            postId={post._id}
            onCommentAdded={() => setCommentsCount(prev => prev + 1)}
            onCommentDeleted={() => setCommentsCount(prev => Math.max(0, prev - 1))}
          />
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
      />
    </article>
  );
};
