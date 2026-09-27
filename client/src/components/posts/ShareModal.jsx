import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { postService } from '../../services/postService';
import { Copy, Check, Twitter, Facebook, Linkedin, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ShareModal = ({ isOpen, onClose, post }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/posts/${post?._id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    postService.sharePost(post._id).catch(() => {});
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSocialShare = (platform) => {
    let url = '';
    const text = encodeURIComponent(`Check out this volunteering update on ConnectServe: "${post?.content?.substring(0, 100)}..."`);

    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'linkedin') {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      postService.sharePost(post._id).catch(() => {});
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Post" maxWidth="max-w-md">
      <div className="space-y-5">
        {/* Copy Direct Link */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Post Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 select-all"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
              icon={copied ? Check : Copy}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Share Directly to Social Platforms
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => handleSocialShare('twitter')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Twitter className="w-4 h-4 text-sky-500" />
              <span>Twitter</span>
            </button>

            <button
              onClick={() => handleSocialShare('linkedin')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Linkedin className="w-4 h-4 text-blue-600" />
              <span>LinkedIn</span>
            </button>

            <button
              onClick={() => handleSocialShare('facebook')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Facebook className="w-4 h-4 text-blue-500" />
              <span>Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
