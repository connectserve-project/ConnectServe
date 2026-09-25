import React from 'react';
import { BADGE_TIER_COLORS, CATEGORY_COLORS } from '../../utils/constants';
import { Award, CheckCircle2, ShieldCheck, Sparkles, Medal, Crown, Trophy, Leaf, BookOpen, HeartHandshake, Utensils } from 'lucide-react';

const iconMap = {
  Sparkles: Sparkles,
  Medal: Medal,
  Award: Award,
  Crown: Crown,
  Trophy: Trophy,
  Leaf: Leaf,
  BookOpen: BookOpen,
  HeartHandshake: HeartHandshake,
  Utensils: Utensils,
};

export const CategoryBadge = ({ category, className = '' }) => {
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
    >
      {category}
    </span>
  );
};

export const AchievementBadge = ({ badge, showIcon = true, size = 'sm', className = '' }) => {
  const IconComp = iconMap[badge.icon] || Award;
  const colorClass = BADGE_TIER_COLORS[badge.tier] || BADGE_TIER_COLORS['Bronze'];

  return (
    <span
      title={badge.description}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm transition-transform hover:scale-105 ${colorClass} ${className}`}
    >
      {showIcon && <IconComp className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{badge.name}</span>
    </span>
  );
};

export const VerifiedOrgBadge = ({ isVerified = true, className = '' }) => {
  if (!isVerified) return null;
  return (
    <span
      title="Verified NGO Organization"
      className={`inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-xs ${className}`}
    >
      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100 dark:fill-emerald-950 text-emerald-600" />
      <span className="hidden sm:inline">Verified Org</span>
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const roleStyles = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300',
    organization: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
    user: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
  };

  const roleLabels = {
    admin: 'Admin',
    organization: 'NGO / Org',
    user: 'Volunteer',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${roleStyles[role] || roleStyles.user}`}
    >
      {roleLabels[role] || role}
    </span>
  );
};
