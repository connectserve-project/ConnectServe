import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { eventService } from '../../services/eventService';
import { Star, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReviewModal = ({ isOpen, onClose, eventId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please provide review feedback.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await eventService.addReview(eventId, { rating, comment: comment.trim() });
      if (res.success) {
        toast.success('Thank you! Your review and rating have been posted.');
        setComment('');
        onClose();
        if (onReviewSubmitted) onReviewSubmitted(res.data.review);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Volunteering Experience" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 text-center">
            How would you rate this community event?
          </label>
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-slate-300 transition-colors focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 fill-amber-400 scale-110'
                      : 'text-slate-300 dark:text-slate-700'
                  } transition-all`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Your Feedback & Highlights
          </label>
          <textarea
            rows="4"
            placeholder="What went well? What was the impact? Share tips for future volunteers..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} icon={Send}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
