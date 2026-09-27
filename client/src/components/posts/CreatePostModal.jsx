import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { postService } from '../../services/postService';
import { eventService } from '../../services/eventService';
import { Image, X, Sparkles, Tag, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [location, setLocation] = useState('');
  const [eventTag, setEventTag] = useState('');
  const [eventsList, setEventsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch available events for tagging
      const fetchEvents = async () => {
        try {
          const res = await eventService.getEvents({ limit: 10 });
          if (res.success && res.data?.events) {
            setEventsList(res.data.events);
          }
        } catch (err) {
          // ignore
        }
      };
      fetchEvents();
    }
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be under 10 MB.');
        return;
      }
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (!tags.includes(cleanTag) && tags.length < 5) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) {
      toast.error('Please enter a caption or upload an image.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (mediaFile) {
        formData.append('media', mediaFile);
      }
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }
      if (location.trim()) {
        formData.append('location', location.trim());
      }
      if (eventTag) {
        formData.append('eventTag', eventTag);
      }

      const res = await postService.createPost(formData);
      if (res.success) {
        toast.success('Post published to community!');
        setContent('');
        handleRemoveImage();
        setTags([]);
        setLocation('');
        setEventTag('');
        onClose();
        if (onPostCreated) onPostCreated(res.data.post);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Post" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author Header */}
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} size="md" isOrg={user?.role === 'organization'} />
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {user?.name}
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
              Public Community Post
            </span>
          </div>
        </div>

        {/* Content Area */}
        <textarea
          rows="4"
          placeholder="Share your experience, Event highlights (e.g. #treeplanting, #cleanearth)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />

        {/* Image Preview */}
        {mediaPreview && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-60">
            <img src={mediaPreview} alt="Upload preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tags input */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {tags.length < 5 && (
            <input
              type="text"
              placeholder="Add tags (press Enter or comma)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          )}
        </div>

        {/* Optional Event Tagging & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Tag Related Event
            </label>
            <select
              value={eventTag}
              onChange={(e) => setEventTag(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">None (General Post)</option>
              {eventsList.map((evt) => (
                <option key={evt._id} value={evt._id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Location (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Seattle, WA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="inline-flex items-center gap-2 cursor-pointer text-emerald-600 hover:text-emerald-700 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors min-h-[44px]">
            <Image className="w-4 h-4" />
            <span>Add Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading} icon={Sparkles}>
              Publish
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
