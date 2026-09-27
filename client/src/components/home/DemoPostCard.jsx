import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MapPin, CheckCircle2, BarChart3, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { postService } from '../../services/postService';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

export const DemoPostCard = ({ post }) => {
  const { user, updateLocalUser } = useAuth();
  const navigate = useNavigate();

  // Handle Like
  const [liked, setLiked] = useState(
    user && Array.isArray(post.likes) ? post.likes.some(id => id === user._id || id === user.id) : false
  );
  const initialLikeCount = Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [popping, setPopping] = useState(false);
  const [voted, setVoted] = useState(null);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like posts');
      return navigate('/login');
    }
    
    // Optimistic UI update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : c - 1));
    setPopping(true);
    setTimeout(() => setPopping(false), 400);

    try {
      await postService.toggleLike(post._id || post.id);
    } catch (error) {
      // Revert on error
      setLiked(!newLiked);
      setLikeCount((c) => (!newLiked ? c + 1 : c - 1));
      toast.error('Failed to update like');
    }
  };

  // Handle Comments
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.commentsList || []);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentsCount = comments.length > 0 ? comments.length : (post.commentsCount !== undefined ? post.commentsCount : (post.comments || 0));

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to comment');
      return navigate('/login');
    }
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await postService.addComment(post._id || post.id, commentText);
      if (res.success && res.data) {
        setComments([...comments, res.data.comment]);
        setCommentText('');
        toast.success('Comment added');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle Share
  const initialSharesCount = post.sharesCount !== undefined ? post.sharesCount : (post.shares || 0);
  const [sharesCount, setSharesCount] = useState(initialSharesCount);

  const handleShare = async () => {
    if (!user) {
      toast.error('Please log in to share posts');
      return navigate('/login');
    }
    try {
      const res = await postService.sharePost(post._id || post.id);
      if (res.success) {
        setSharesCount((prev) => prev + 1);
        toast.success('Post shared successfully!');
      }
    } catch (error) {
      toast.error('Failed to share post');
    }
  };

  // Handle Follow
  const authorId = post.author?._id || post.author?.id;
  const initialJoined = user?.following?.includes(authorId) || false;
  const [joined, setJoined] = useState(initialJoined);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please log in to follow');
      return navigate('/login');
    }
    setIsFollowing(true);
    try {
      const res = await userService.toggleFollow(authorId);
      if (res.success) {
        setJoined(res.data.isFollowing);
        // Update user context so the state persists across components
        const newFollowing = res.data.isFollowing 
          ? [...(user.following || []), authorId]
          : (user.following || []).filter(id => id !== authorId);
        updateLocalUser({ following: newFollowing });
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error('Failed to follow organization');
    } finally {
      setIsFollowing(false);
    }
  };

  // Determine if follow button should be shown
  const isOwnPost = user && (user._id === authorId || user.id === authorId);

  const totalVotes = post.pollOptions?.reduce((sum, o) => sum + o.votes, 0) || 0;

  const authorName = post.author?.name || 'Community Member';
  const authorAvatar = post.author?.avatar?.url || post.author?.avatar || 'https://i.pravatar.cc/150?img=68';
  const isVerified = post.author?.orgDetails?.isVerified || post.author?.verified;
  const isOrg = post.author?.role === 'organization';
  const postLocation = post.location || post.author?.location;
  const mediaUrl = post.media?.url || post.image;

  return (
    <article className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={post.author?._id ? `/profile/${post.author.username || post.author._id}` : '#'}>
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
              loading="lazy"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link to={post.author?._id ? `/profile/${post.author.username || post.author._id}` : '#'}>
                <span className="font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 transition-colors">
                  {authorName}
                </span>
              </Link>
              {isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100 dark:fill-emerald-950 text-emerald-600" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>{post.time || 'Recent'}</span>
              {postLocation && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> {postLocation}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {isOrg && !isOwnPost && user && (
          <button
            onClick={handleFollow}
            disabled={isFollowing}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
              joined
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/25 hover:shadow-lg'
            } ${isFollowing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isFollowing ? '...' : joined ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
        {post.content}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Event tag banner */}
      {post.eventTag && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
              {typeof post.eventTag === 'object' ? post.eventTag.title : 'Tagged Event'}
            </span>
          </div>
          <Link
            to={`/events/${post.eventTag._id || post.eventTag.id || (typeof post.eventTag === 'object' ? post.eventTag.id : post.eventTag)}`}
            className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            View Events →
          </Link>
        </div>
      )}

      {/* Poll */}
      {post.pollOptions && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{totalVotes} votes</span>
          </div>
          {post.pollOptions.map((opt, idx) => {
            const pct = Math.round((opt.votes / totalVotes) * 100);
            const isVoted = voted === idx;
            return (
              <button
                key={opt.label}
                onClick={() => setVoted(idx)}
                className="relative w-full text-left rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group"
              >
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    isVoted ? 'bg-violet-200/70 dark:bg-violet-900/50' : 'bg-slate-100 dark:bg-slate-800/70'
                  }`}
                  style={{ width: voted !== null ? `${pct}%` : '0%' }}
                />
                <div className="relative flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <span>{opt.label}</span>
                  {voted !== null && <span className="text-slate-500 dark:text-slate-400">{pct}%</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Media */}
      {mediaUrl && !post.pollOptions && (
        <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-[420px]">
          <img
            src={mediaUrl}
            alt="Post attachment"
            className="w-full h-auto max-h-[420px] object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Engagement bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${
            liked ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-rose-600 stroke-rose-600' : ''} ${popping ? 'animate-heartPop' : ''}`} />
          <span>{likeCount}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-colors ${
            showComments ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>{commentsCount}</span>
        </button>

        <button onClick={handleShare} className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">{sharesCount}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          {comments.map((comment) => (
            <div key={comment._id || comment.id} className="flex gap-3 text-sm">
              <img
                src={comment.author?.avatar?.url || comment.author?.avatar || 'https://i.pravatar.cc/150'}
                alt={comment.author?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl rounded-tl-none px-4 py-2.5 flex-1">
                <div className="font-bold text-slate-900 dark:text-white mb-0.5">
                  {comment.author?.name || 'User'}
                </div>
                <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
              </div>
            </div>
          ))}
          
          <form onSubmit={handleAddComment} className="flex gap-3 mt-4">
            <img
              src={user?.avatar?.url || 'https://i.pravatar.cc/150'}
              alt={user?.name || 'You'}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                disabled={isSubmittingComment}
              />
            </div>
          </form>
        </div>
      )}
    </article>
  );
};
