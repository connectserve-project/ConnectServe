/**
 * Evaluates and awards badges to a user based on volunteer hours and participation
 * @param {object} user - Mongoose User document
 * @param {object} event - Event document just attended (optional)
 * @returns {Array} - Newly unlocked badges
 */
const evaluateBadges = (user, event = null) => {
  const currentBadges = new Set((user.badges || []).map(b => b.name));
  const newBadges = [];

  const addBadgeIfMissing = (badge) => {
    if (!currentBadges.has(badge.name)) {
      user.badges.push(badge);
      currentBadges.add(badge.name);
      newBadges.push(badge);
    }
  };

  const hours = user.volunteerHours || 0;

  // Hour-based milestone badges
  if (hours >= 1) {
    addBadgeIfMissing({
      name: 'First Step',
      tier: 'Bronze',
      icon: 'Sparkles',
      description: 'Completed your very first volunteer hour with ConnectServe!',
    });
  }

  if (hours >= 10) {
    addBadgeIfMissing({
      name: 'Bronze Volunteer',
      tier: 'Bronze',
      icon: 'Medal',
      description: 'Contributed over 10 hours of active community service.',
    });
  }

  if (hours >= 25) {
    addBadgeIfMissing({
      name: 'Silver Volunteer',
      tier: 'Silver',
      icon: 'Award',
      description: 'Dedicated 25+ hours towards impactful social causes.',
    });
  }

  if (hours >= 50) {
    addBadgeIfMissing({
      name: 'Gold Champion',
      tier: 'Gold',
      icon: 'Crown',
      description: 'Logged 50+ hours of service, inspiring the entire community.',
    });
  }

  if (hours >= 100) {
    addBadgeIfMissing({
      name: 'Platinum Hero',
      tier: 'Platinum',
      icon: 'Trophy',
      description: 'Reached monumental 100+ volunteer hours. A true pillar of change.',
    });
  }

  // Category specific badges
  if (event && event.category) {
    if (event.category === 'Environment') {
      addBadgeIfMissing({
        name: 'Earth Guardian',
        tier: 'Special',
        icon: 'Leaf',
        description: 'Participated in eco-conservation and environmental service.',
      });
    } else if (event.category === 'Education' || event.category === 'Youth Empowerment') {
      addBadgeIfMissing({
        name: 'Knowledge Torch',
        tier: 'Special',
        icon: 'BookOpen',
        description: 'Empowered youth and students through education volunteering.',
      });
    } else if (event.category === 'Health & Wellness' || event.category === 'Crisis & Disaster Relief') {
      addBadgeIfMissing({
        name: 'Guardian Angel',
        tier: 'Special',
        icon: 'HeartHandshake',
        description: 'Aided in healthcare or emergency disaster relief initiatives.',
      });
    } else if (event.category === 'Hunger & Poverty') {
      addBadgeIfMissing({
        name: 'Food Champion',
        tier: 'Special',
        icon: 'Utensils',
        description: 'Helped distribute meals and fight hunger in the community.',
      });
    }
  }

  return newBadges;
};

module.exports = { evaluateBadges };
