import React, { useState } from 'react';
import { User as UserIcon, Building2 } from 'lucide-react';

export const Avatar = ({ src, alt = 'Avatar', size = 'md', className = '', isOrg = false }) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-lg',
    '2xl': 'w-28 h-28 text-2xl',
  };

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
    '2xl': 'w-14 h-14',
  };

  const avatarSrc = typeof src === 'object' ? src?.url : src;
  const hasImage = Boolean(avatarSrc && avatarSrc.trim() && !imgError);
  const initial = alt && alt !== 'Avatar' ? alt.charAt(0).toUpperCase() : null;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 ${
        hasImage
          ? 'bg-slate-100 dark:bg-slate-800'
          : 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 font-bold'
      } select-none ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {hasImage ? (
        <img
          src={avatarSrc}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : initial ? (
        <span>{initial}</span>
      ) : isOrg ? (
        <Building2 className={`${iconSizes[size] || iconSizes.md} text-slate-400 dark:text-slate-500`} />
      ) : (
        <UserIcon className={`${iconSizes[size] || iconSizes.md} text-slate-400 dark:text-slate-500`} />
      )}
    </div>
  );
};

