import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { EVENT_CATEGORIES, POPULAR_SKILLS } from '../utils/constants';
import { Button } from '../components/common/Button';
import { Image, X, Calendar, Clock, MapPin, Users, Award, ArrowLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateEditEvent = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Environment',
    date: '',
    time: '09:00 AM - 01:00 PM',
    location: '',
    locationType: 'in-person',
    volunteerSlots: 20,
    hoursGranted: 4,
    requirements: [],
    skillsNeeded: [],
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [reqInput, setReqInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchExisting = async () => {
        try {
          const res = await eventService.getEventById(id);
          if (res.success && res.data?.event) {
            const e = res.data.event;
            setFormData({
              title: e.title,
              description: e.description,
              category: e.category,
              date: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
              time: e.time || '09:00 AM - 01:00 PM',
              location: e.location,
              locationType: e.locationType || 'in-person',
              volunteerSlots: e.volunteerSlots || 20,
              hoursGranted: e.hoursGranted || 4,
              requirements: e.requirements || [],
              skillsNeeded: e.skillsNeeded || [],
            });
            if (e.banner?.url) setBannerPreview(e.banner.url);
          }
        } catch (err) {
          toast.error('Failed to load event details.');
        }
      };
      fetchExisting();
    }
  }, [id, isEditing]);

  const handleBannerSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleAddRequirement = (e) => {
    if (e.key === 'Enter' && reqInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({ ...prev, requirements: [...prev.requirements, reqInput.trim()] }));
      setReqInput('');
    }
  };

  const handleRemoveRequirement = (idx) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== idx),
    }));
  };

  const handleAddSkill = (skill) => {
    if (!formData.skillsNeeded.includes(skill)) {
      setFormData(prev => ({ ...prev, skillsNeeded: [...prev.skillsNeeded, skill] }));
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skillsNeeded: prev.skillsNeeded.filter(s => s !== skill),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.date || !formData.location) {
      toast.error('Please fill in all required event fields.');
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'requirements' || key === 'skillsNeeded') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      if (bannerFile) {
        data.append('banner', bannerFile);
      }

      if (isEditing) {
        const res = await eventService.updateEvent(id, data);
        if (res.success) {
          toast.success('Event updated successfully!');
          navigate(`/events/${id}`);
        }
      } else {
        const res = await eventService.createEvent(data);
        if (res.success) {
          toast.success('Community service event published!');
          navigate(`/events/${res.data.event._id}`);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      <Link
        to="/org/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Organizer Dashboard</span>
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {isEditing ? 'Edit Drive' : 'Host a Community Project'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {isEditing ? 'Update Event Details' : 'Create Volunteer Event'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish your Event details to attract dedicated volunteers and log verified impact hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Event Banner Image
            </label>
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl overflow-hidden p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-800/40">
              {bannerPreview ? (
                <div className="relative max-h-60 rounded-2xl overflow-hidden mx-auto">
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-56 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setBannerFile(null);
                      setBannerPreview(null);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <Image className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Click to select high-res banner photo
                  </span>
                  <span className="text-[11px] text-slate-400">
                    PNG, JPG, or WEBP up to 10 MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerSelect}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. City Beach Cleanup & Microplastics Drive"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cause Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {EVENT_CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Event Description & Mission *
            </label>
            <textarea
              rows="5"
              required
              placeholder="Detail the volunteer duties, positive community impact, what to bring, and schedule..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-4 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Date, Time, Location Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Time Window
              </label>
              <input
                type="text"
                placeholder="09:00 AM - 01:00 PM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Location Format
              </label>
              <select
                value={formData.locationType}
                onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual / Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Address / Meeting Link *
              </label>
              <input
                type="text"
                required
                placeholder="Discovery Park, Seattle, WA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Volunteer Slots & Hours Granted */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Volunteer Capacity (Slots) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.volunteerSlots}
                onChange={(e) => setFormData({ ...formData, volunteerSlots: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Volunteer Hours Granted (Credited to attendee certificate) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={formData.hoursGranted}
                onChange={(e) => setFormData({ ...formData, hoursGranted: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Requirements list */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Event Requirements (Press Enter to add)
            </label>
            <input
              type="text"
              placeholder="e.g. Wear closed-toe shoes, Bring refillable bottle (Press Enter)"
              value={reqInput}
              onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={handleAddRequirement}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
            />
            <div className="flex flex-wrap gap-2">
              {formData.requirements.map((req, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {req}
                  <button type="button" onClick={() => handleRemoveRequirement(i)}>
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Suggested Skills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Skills Needed (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.map((sk) => {
                const isSelected = formData.skillsNeeded.includes(sk);
                return (
                  <button
                    type="button"
                    key={sk}
                    onClick={() => (isSelected ? handleRemoveSkill(sk) : handleAddSkill(sk))}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors min-h-[38px] ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? `✓ ${sk}` : `+ ${sk}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Link to="/org/dashboard">
              <Button variant="ghost" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              icon={Sparkles}
            >
              {isEditing ? 'Save Changes' : 'Publish Community Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
