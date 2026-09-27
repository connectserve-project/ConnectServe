import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { formatTimeAgo } from '../../utils/dateUtils';
import { postService } from '../../services/postService';
import { Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CommentList = ({ postId, onCommentAdded, onCommentDeleted }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await postService.getPostById(postId);
        if (res.success && res.data?.comments) {
          setComments(res.data.comments);
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to comment.');
      return;
    }
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await postService.addComment(postId, newComment.trim());
      if (res.success && res.data?.comment) {
        setComments([...comments, res.data.comment]);
        setNewComment('');
        if (onCommentAdded) onCommentAdded();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await postService.deleteComment(postId, commentId);
      if (res.success) {
        setComments(comments.filter(c => c._id !== commentId));
        if (onCommentDeleted) onCommentDeleted();
      }
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Add comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-2.5 items-center">
          <Avatar src={user?.avatar} size="sm" isOrg={user?.role === 'organization'} />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Write a supportive comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="absolute right-1.5 top-1.5 p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-slate-500">
          <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
            Log in
          </Link>{' '}
          to join the conversation and leave a comment.
        </p>
      )}

      {/* Comment entries */}
      <div className="space-y-3 pt-2">
        {comments.map((comment) => {
          const isAuthor = user && comment.author?._id === user._id;
          return (
            <div key={comment._id} className="flex items-start gap-2.5 group">
              <Link to={`/profile/${comment.author?.username || comment.author?._id}`}>
                <Avatar src={comment.author?.avatar} size="xs" isOrg={comment.author?.role === 'organization'} />
              </Link>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 rounded-2xl px-3.5 py-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/profile/${comment.author?.username || comment.author?._id}`}
                    className="font-bold text-slate-900 dark:text-white hover:text-emerald-600"
                  >
                    {comment.author?.name}
                  </Link>
                  <span className="text-[10px] text-slate-400">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mt-1 break-words">
                  {comment.content}
                </p>
              </div>

              {(isAuthor || isAdmin) && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                  title="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {!loading && comments.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-2">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
};
