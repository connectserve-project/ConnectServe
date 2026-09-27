// Realistic demo content for the public homepage social experience.
// Locations are used sparingly and naturally (Sector 17, Sukhna Lake, Mohali,
// Panchkula, Zirakpur, etc.) rather than repeating "Chandigarh" everywhere.

export const heroSlides = [
  {
    id: 1,
    tag: 'Community Action',
    title: 'Empowering Communities, Connecting Causes.',
    body: 'ConnectServe links passionate volunteers with verified NGOs to drive real impact in Education, Environment, Crisis Relief & Animal Welfare.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=80',
    accent: 'from-violet-600 via-purple-600 to-pink-500',
  },
  {
    id: 2,
    tag: 'Verified NGOs',
    title: 'Join Top Local NGO Drives Near You.',
    body: 'Discover active events from Green Earth Initiative, Teach for India, Red Cross Society, and Wildlife Society.',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&auto=format&fit=crop&q=80',
    accent: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    id: 3,
    tag: 'Volunteer Growth',
    title: 'Earn Verified Service Hours & Badges.',
    body: 'Track your community hours, unlock special achievement badges, and download official certificates for your resume.',
    image: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=1200&auto=format&fit=crop&q=80',
    accent: 'from-rose-500 via-coral-500 to-amber-500',
  },
  {
    id: 4,
    tag: 'Real Impact',
    title: 'From Local Drives to Emergency Relief.',
    body: 'Participate in tree plantations, blood donation camps, digital literacy bootcamps, and stray animal vaccination drives.',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&auto=format&fit=crop&q=80',
    accent: 'from-blue-600 via-indigo-500 to-purple-600',
  },
];

export const floatingChips = [
  { id: 1, label: '320 people joined 🌱', style: 'top-[6%] left-[2%] sm:left-[-4%]' },
  { id: 2, label: 'New community post', style: 'top-[16%] right-[-2%] sm:right-[-6%]' },
  { id: 3, label: '42 people are discussing this', style: 'bottom-[30%] left-[-4%] sm:left-[-8%]' },
  { id: 4, label: 'Event · Sunday', style: 'bottom-[14%] right-[4%]' },
  { id: 5, label: 'Aisha liked this ❤️', style: 'top-[42%] right-[-6%] hidden sm:flex' },
  { id: 6, label: '+128 impact points', style: 'bottom-[-4%] left-[18%] hidden sm:flex' },
];

export const activityStrip = [
  { id: 1, emoji: '🌱', title: 'Tree Plantation', meta: 'Sukhna Lake · 32 joined', color: 'from-emerald-400 to-teal-500' },
  { id: 2, emoji: '🧹', title: 'Park Cleanup', meta: 'Sector 22 · Saturday', color: 'from-cyan-400 to-blue-500' },
  { id: 3, emoji: '🩸', title: 'Blood Donation Drive', meta: 'Sector 34 · 64 joined', color: 'from-rose-400 to-coral-500' },
  { id: 4, emoji: '📚', title: 'Weekend Tutoring', meta: 'Mohali · 12 joined', color: 'from-violet-400 to-purple-500' },
  { id: 5, emoji: '🐕', title: 'Animal Care', meta: 'Zirakpur · 9 joined', color: 'from-amber-400 to-orange-500' },
  { id: 6, emoji: '🚲', title: 'Sunday Cycling Meetup', meta: 'Leisure Valley · 21 joined', color: 'from-teal-400 to-emerald-500' },
];

export const feedPosts = [
  {
    id: 1,
    type: 'text',
    author: { name: 'Aisha Sharma', avatar: 'https://i.pravatar.cc/150?img=47', role: 'user', location: 'Sector 35' },
    time: '2h',
    content: "The sunrise at Sukhna was unreal today 🌅\nAnyone up for a weekend cleanup?",
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=900&auto=format&fit=crop&q=80',
    likes: 184,
    comments: 26,
    shares: 12,
    tags: ['SukhnaLake', 'WeekendCleanup'],
  },
  {
    id: 2,
    type: 'org',
    author: { name: 'Green Punjab Initiative', avatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80', role: 'organization', verified: true, location: 'Sukhna Lake' },
    time: '4h',
    content: "We're getting together this Sunday to plant native trees and clean up the area around the lake. Who's joining?",
    joined: 48,
    likes: 210,
    comments: 34,
    shares: 19,
    eventTag: { title: 'Tree Plantation Drive · Sukhna Lake', color: 'from-emerald-500 to-teal-500' },
  },
  {
    id: 3,
    type: 'text',
    author: { name: 'Rahul Mehta', avatar: 'https://i.pravatar.cc/150?img=12', role: 'user', location: 'Mohali' },
    time: '6h',
    content: 'Looking for a few people who can help tutor school students this Saturday. Even an hour would help.',
    likes: 72,
    comments: 14,
    shares: 5,
    tags: ['WeekendTutoring'],
  },
  {
    id: 4,
    type: 'poll',
    author: { name: 'Tricity Cycling Community', avatar: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=150&auto=format&fit=crop&q=80', role: 'organization', verified: true, location: 'Tricity' },
    time: '8h',
    content: 'Which route should we take this weekend?',
    likes: 96,
    comments: 41,
    shares: 8,
    pollOptions: [
      { label: 'Sukhna → Lake Road', votes: 58 },
      { label: 'Sector 17 → Rose Garden', votes: 31 },
      { label: 'Mohali Loop', votes: 22 },
    ],
  },
  {
    id: 5,
    type: 'image',
    author: { name: 'Paws Community', avatar: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=150&auto=format&fit=crop&q=80', role: 'organization', verified: true, location: 'Panchkula' },
    time: '10h',
    content: 'Three puppies were rescued yesterday. Huge thanks to everyone who showed up. 🐾',
    image: 'https://images.unsplash.com/photo-1601758125946-6ac8dc44dc5f?w=900&auto=format&fit=crop&q=80',
    likes: 342,
    comments: 58,
    shares: 27,
  },
  {
    id: 6,
    type: 'text',
    author: { name: 'Simran Kaur', avatar: 'https://img.icons8.com/?size=100&id=77876&format=png&color=000000', role: 'user', location: 'New Chandigarh' },
    time: '1d',
    content: "Joined 24 people for a cleanup today. We collected 18 bags of waste. 🌱 Feels good to actually see the difference by evening.",
    image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=900&auto=format&fit=crop&q=80',
    likes: 184,
    comments: 26,
    shares: 12,
  },
];

export const communities = [
  {
    id: 1,
    name: 'Sukhna Lake Community',
    members: '4.8K',
    cover: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&auto=format&fit=crop&q=80',
    avatarGradient: 'from-emerald-400 to-teal-500',
    activity: '32 posts this week',
    initials: 'SL',
  },
  {
    id: 2,
    name: 'Tricity Animal Lovers',
    members: '7.6K',
    cover: 'https://images.unsplash.com/photo-1517849845537-4d257902861a?w=800&auto=format&fit=crop&q=80',
    avatarGradient: 'from-amber-400 to-orange-500',
    activity: '3 rescues this month',
    initials: 'AL',
  },
  {
    id: 3,
    name: 'Chandigarh Cycling Club',
    members: '5.1K',
    cover: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&q=80',
    avatarGradient: 'from-cyan-400 to-blue-500',
    activity: 'Ride planned Sunday',
    initials: 'CC',
  },
  {
    id: 4,
    name: 'Green Communities',
    members: '8.3K',
    cover: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop&q=80',
    avatarGradient: 'from-emerald-400 to-lime-500',
    activity: '48 joined a plantation drive',
    initials: 'GC',
  },
  {
    id: 5,
    name: 'Students & Young Professionals',
    members: '12.2K',
    cover: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    avatarGradient: 'from-violet-400 to-purple-500',
    activity: 'Hiring & mentorship threads',
    initials: 'SY',
  },
  {
    id: 6,
    name: 'Mohali Community',
    members: '9.7K',
    cover: 'https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=800&auto=format&fit=crop&q=80',
    avatarGradient: 'from-pink-400 to-rose-500',
    activity: '12 local requests open',
    initials: 'MC',
  },
  {
    id: 7,
    name: 'Panchkula Neighbours',
    members: '6.2K',
    cover: 'https://images.unsplash.com/photo-1560184611-ff3e53f00e8f?w=800&auto=format&fit=crop&q=80',
    avatarGradient: 'from-teal-400 to-cyan-500',
    activity: 'Weekend market this Sat',
    initials: 'PN',
  },
  {
    id: 8,
    name: 'Weekend Explorers',
    members: '4.2K',
    cover: 'https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=800&auto=format&fit=crop&q=80',
    avatarGradient: 'from-coral-400 to-orange-500',
    activity: 'Trek planned to Kasauli',
    initials: 'WE',
  },
];

export const trendingTags = [
  '#SukhnaLake',
  '#WeekendCleanup',
  '#Tricity',
  '#AnimalCare',
  '#Cycling',
  '#TreePlantation',
  '#CommunityEvents',
];

export const nearbyActivities = [
  {
    id: 1,
    title: 'Weekend Cleanup',
    when: 'Sunday · 8:00 AM',
    location: 'Sector 22',
    joined: 32,
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=700&auto=format&fit=crop&q=80',
    category: 'Environment',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    id: 2,
    title: 'Tree Plantation Drive',
    when: 'Saturday · 9:00 AM',
    location: 'Sukhna Lake',
    joined: 48,
    image: 'https://images.unsplash.com/photo-1552799446-159ba9523315?w=700&auto=format&fit=crop&q=80',
    category: 'Environment',
    accent: 'from-teal-500 to-cyan-500',
  },
  {
    id: 3,
    title: 'Community Food Distribution',
    when: 'Friday · 5:30 PM',
    location: 'Sector 17',
    joined: 21,
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&auto=format&fit=crop&q=80',
    category: 'Hunger & Poverty',
    accent: 'from-orange-500 to-coral-500',
  },
  {
    id: 4,
    title: 'Teaching Support',
    when: 'Saturday · 10:00 AM',
    location: 'Mohali',
    joined: 14,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=700&auto=format&fit=crop&q=80',
    category: 'Education',
    accent: 'from-violet-500 to-purple-500',
  },
  {
    id: 5,
    title: 'Animal Rescue Workshop',
    when: 'Sunday · 11:00 AM',
    location: 'Zirakpur',
    joined: 27,
    image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=700&auto=format&fit=crop&q=80',
    category: 'Animal Welfare',
    accent: 'from-amber-500 to-orange-500',
  },
];

export const communityRequests = [
  {
    id: 1,
    author: { name: 'Neha Kapoor', avatar: 'https://i.pravatar.cc/150?img=24' },
    location: 'Sector 22',
    text: 'Need a few people to help clean the neighborhood park this Saturday.',
    responders: 9,
  },
  {
    id: 2,
    author: { name: 'Karan Bansal', avatar: 'https://i.pravatar.cc/150?img=15' },
    location: 'Mohali',
    text: 'Looking for someone who can help two students with maths, twice a week.',
    responders: 4,
  },
  {
    id: 3,
    author: { name: 'Vikram Singh', avatar: 'https://i.pravatar.cc/150?img=51' },
    location: 'Panchkula',
    text: 'Our local shelter needs food donations this week — even small amounts help.',
    responders: 17,
  },
  {
    id: 4,
    author: { name: 'Priya Nair', avatar: 'https://i.pravatar.cc/150?img=44' },
    location: 'Sector 34',
    text: 'Anyone available to help with the blood donation awareness drive this weekend?',
    responders: 22,
  },
];

export const impactStats = [
  { value: 12480, suffix: '+', label: 'participants' },
  { value: 1284, suffix: '', label: 'activities' },
  { value: 42810, suffix: '', label: 'community hours' },
  { value: 85240, suffix: '', label: 'people reached' },
];

export const testimonials = [
  {
    id: 1,
    quote: "I joined because I wanted to know what was happening around me. Somehow I ended up helping organize a cleanup with people I'd never met before.",
    name: 'Aisha',
    role: 'Sector 35',
    avatar: 'https://img.icons8.com/?size=100&id=77876&format=png&color=000000',
  },
  {
    id: 2,
    quote: "It's easier to get people involved when the opportunity feels like something your community is already talking about.",
    name: 'Deepak Chauhan',
    role: 'Community organizer, Mohali',
    avatar: 'https://img.icons8.com/?size=100&id=103539&format=png&color=000000',
  },
  {
    id: 3,
    quote: "I came for the cycling group and ended up on a tree-plantation crew at Sukhna. Wasn't planning that, but it's now the best part of my weekend.",
    name: 'Simran',
    role: 'New Chandigarh',
    avatar: 'https://img.icons8.com/?size=100&id=77876&format=png&color=000000',
  },
];

export const organizationSpotlight = {
  name: 'Green Chandigarh Initiative',
  followers: '12.4K',
  avatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80',
  cover: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1000&auto=format&fit=crop&q=80',
};

export const heroImage = {
  main: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1000&auto=format&fit=crop&q=80',
};
