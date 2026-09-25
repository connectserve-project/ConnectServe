const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const EventRegistration = require('../models/EventRegistration');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Review = require('../models/Review');

const seedRealData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Event.deleteMany(),
      Post.deleteMany(),
      Comment.deleteMany(),
      EventRegistration.deleteMany(),
      Certificate.deleteMany(),
      Notification.deleteMany(),
      Conversation.deleteMany(),
      Message.deleteMany(),
      Review.deleteMany(),
    ]);

    console.log('[Seed] Creating 4 NGOs from PDF document...');

    // 1. Green Earth Initiative
    const greenEarth = await User.create({
      name: 'Green Earth Initiative',
      username: 'greenearth',
      email: 'greenearth@connectserve.in',
      password: 'password@123',
      role: 'organization',
      bio: 'Green Earth Initiative works on protecting local ecosystems and promoting sustainable living. On ConnectServe, this NGO will coordinate volunteers for tree plantation, clean-up, and awareness drives, and will use the platform to post events, track volunteer sign-ups, and share impact updates with the community.',
      avatar: { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop&q=80' },
      banner: { url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&auto=format&fit=crop&q=80' },
      location: 'Sukhna Lake, Sector 1',
      state: 'Chandigarh',
      country: 'India',
      orgDetails: {
        mission: 'Protecting local ecosystems and promoting sustainable living.',
        registrationNumber: 'GEI-2024-CH01',
        isVerified: true,
        contactPerson: 'Aditya Roy',
        foundedYear: 2018,
        category: 'Environment',
      },
      socialLinks: { website: 'https://greenearthinitiative.org' },
    });

    // 2. Teach for India
    const teachIndia = await User.create({
      name: 'Teach for India',
      username: 'teachindia',
      email: 'teachindia@connectserve.in',
      password: 'password@123',
      role: 'organization',
      bio: 'Teach for India focuses on improving access to quality education for children from underserved communities. Through ConnectServe, this NGO will list tutoring and mentorship events, recruit volunteer teachers, and manage attendance for ongoing learning programs.',
      avatar: { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80' },
      banner: { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80' },
      location: 'Phase 7, Mohali',
      state: 'Punjab',
      country: 'India',
      orgDetails: {
        mission: 'Improving access to quality education for children from underserved communities.',
        registrationNumber: 'TFI-2022-PB09',
        isVerified: true,
        contactPerson: 'Meera Kapoor',
        foundedYear: 2015,
        category: 'Education',
      },
      socialLinks: { website: 'https://teachforindia.org' },
    });

    // 3. Red Cross Society
    const redCross = await User.create({
      name: 'Red Cross Society',
      username: 'redcross',
      email: 'redcross@connectserve.in',
      password: 'password@123',
      role: 'organization',
      bio: 'Red Cross Society coordinates disaster preparedness and emergency relief efforts. On ConnectServe, this NGO will use the platform to mobilize volunteers quickly during emergencies, organize blood donation camps, and run first-aid training sessions for the community.',
      avatar: { url: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=400&auto=format&fit=crop&q=80' },
      banner: { url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=80' },
      location: 'Sector 11-B, Chandigarh',
      state: 'Chandigarh',
      country: 'India',
      orgDetails: {
        mission: 'Coordinating disaster preparedness, blood donation, and emergency relief.',
        registrationNumber: 'RCS-1920-CH11',
        isVerified: true,
        contactPerson: 'Dr. Rajesh Sharma',
        foundedYear: 1920,
        category: 'Crisis & Disaster Relief',
      },
      socialLinks: { website: 'https://indianredcross.org' },
    });

    // 4. Wildlife Society
    const wildlifeSociety = await User.create({
      name: 'Wildlife Society',
      username: 'wildlife',
      email: 'wildlife@connectserve.in',
      password: 'password@123',
      role: 'organization',
      bio: 'Wildlife Society is dedicated to the protection and welfare of animals, both domestic and wild. On ConnectServe, this NGO will use the platform to organize adoption drives, rescue-volunteer sign-ups, and awareness campaigns for animal welfare and habitat conservation.',
      avatar: { url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80' },
      banner: { url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&auto=format&fit=crop&q=80' },
      location: 'Sector 4, Panchkula',
      state: 'Haryana',
      country: 'India',
      orgDetails: {
        mission: 'Dedicated to the protection and welfare of domestic and wild animals.',
        registrationNumber: 'WS-2019-PK04',
        isVerified: true,
        contactPerson: 'Sunita Verma',
        foundedYear: 2019,
        category: 'Animal Welfare',
      },
      socialLinks: { website: 'https://wildlifesociety.org' },
    });

    console.log('[Seed] Creating 4 sample volunteers...');

    const aarav = await User.create({
      name: 'Aarav Sharma',
      username: 'aarav_sharma',
      email: 'aarav@connectserve.in',
      password: 'password@123',
      role: 'user',
      bio: 'Passionate environmental volunteer & outdoor enthusiast based in Sector 35, Chandigarh. Always ready for tree plantation drives!',
      avatar: { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
      location: 'Sector 35, Chandigarh',
      volunteerHours: 34,
      skills: ['Tree Plantation', 'Waste Management', 'Community Outreach'],
      interests: ['Environment', 'Sustainability', 'Youth Empowerment'],
      badges: [
        { name: 'Eco Warrior', tier: 'Gold', icon: 'Leaf', description: 'Participated in 5+ environmental cleanups and plantation drives.' },
        { name: 'Early Bird', tier: 'Bronze', icon: 'Sun', description: 'Consistently first to check in at morning drives.' }
      ],
    });

    const ananya = await User.create({
      name: 'Ananya Verma',
      username: 'ananya_v',
      email: 'ananya@connectserve.in',
      password: 'password@123',
      role: 'user',
      bio: 'Education student passionate about child literacy, storytelling, and digital bootcamps for primary grade kids.',
      avatar: { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' },
      location: 'Phase 3B2, Mohali',
      volunteerHours: 48,
      skills: ['Tutoring', 'Public Speaking', 'Curriculum Planning', 'Mentorship'],
      interests: ['Education', 'Youth Empowerment', 'Community Development'],
      badges: [
        { name: 'Master Tutor', tier: 'Platinum', icon: 'BookOpen', description: 'Logged over 40 hours of teaching and reading circles.' },
      ],
    });

    const rohan = await User.create({
      name: 'Rohan Gupta',
      username: 'rohan_g',
      email: 'rohan@connectserve.in',
      password: 'password@123',
      role: 'user',
      bio: 'Certified First Responder & Red Cross volunteer. Active in blood donation drives & relief supply packaging.',
      avatar: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
      location: 'Sector 22, Chandigarh',
      volunteerHours: 26,
      skills: ['First Aid', 'CPR', 'Logistics', 'Emergency Response'],
      interests: ['Crisis & Disaster Relief', 'Health & Wellness'],
      badges: [
        { name: 'Lifesaver', tier: 'Gold', icon: 'Heart', description: 'Certified CPR volunteer and frequent blood donor.' },
      ],
    });

    const priya = await User.create({
      name: 'Priya Patel',
      username: 'priya_patel',
      email: 'priya@connectserve.in',
      password: 'password@123',
      role: 'user',
      bio: 'Animal lover and pet shelter volunteer. Helping stray animals get vaccinated and find loving homes.',
      avatar: { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80' },
      location: 'Sector 12, Panchkula',
      volunteerHours: 19,
      skills: ['Animal Care', 'Pet Adoption Facilitation', 'Social Media Outreach'],
      interests: ['Animal Welfare', 'Community Development'],
      badges: [
        { name: 'Animal Guardian', tier: 'Silver', icon: 'PawPrint', description: 'Supported 3+ stray animal vaccination and adoption drives.' },
      ],
    });

    console.log('[Seed] Creating 20 detailed events from PDF...');

    const eventsData = [
      // --- Green Earth Initiative (Environment) ---
      {
        organizer: greenEarth._id,
        title: 'Community Tree Plantation Drive',
        description: 'Planting native saplings in local parks and along roadsides with volunteer teams. Help us increase green cover in Chandigarh and combat urban heat.',
        category: 'Environment',
        date: new Date(Date.now() + 86400000 * 3), // 3 days from now
        endDate: new Date(Date.now() + 86400000 * 3 + 14400000),
        time: '07:30 AM - 11:30 AM',
        location: 'Sukhna Lake Park & Sector 1 Greens',
        locationType: 'in-person',
        volunteerSlots: 35,
        registeredCount: 18,
        hoursGranted: 4,
        banner: { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Bring your own water bottle', 'Wear comfortable outdoor footwear', 'Sun hat recommended'],
        skillsNeeded: ['Physical stamina', 'Planting techniques', 'Teamwork'],
        status: 'upcoming',
        isFeatured: true,
      },
      {
        organizer: greenEarth._id,
        title: 'River & Lakefront Clean-Up',
        description: 'Half-day clean-up drive to clear plastic waste from a local water body. Volunteers will be provided gloves, bags, and safety gear to clean the shoreline.',
        category: 'Environment',
        date: new Date(Date.now() + 86400000 * 7),
        time: '08:00 AM - 12:00 PM',
        location: 'Patiala Ki Rao Waterfront, Sector 25',
        locationType: 'in-person',
        volunteerSlots: 40,
        registeredCount: 24,
        hoursGranted: 4,
        banner: { url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Closed-toe shoes mandatory', 'Working gloves provided'],
        skillsNeeded: ['Waste Sorting', 'Community Leadership'],
        status: 'upcoming',
        isFeatured: true,
      },
      {
        organizer: greenEarth._id,
        title: 'Plastic-Free Awareness Walk',
        description: 'A neighborhood walk and pledge campaign to reduce single-use plastic. We will distribute cloth bags to residents and local shopkeepers in Sector 17.',
        category: 'Environment',
        date: new Date(Date.now() + 86400000 * 12),
        time: '09:00 AM - 01:00 PM',
        location: 'Sector 17 Plaza, Chandigarh',
        locationType: 'in-person',
        volunteerSlots: 25,
        registeredCount: 12,
        hoursGranted: 4,
        banner: { url: 'https://images.unsplash.com/photo-1526958071101-63332467d581?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['High energy', 'Pledge sign-up forms handling'],
        skillsNeeded: ['Public Engagement', 'Awareness Campaigning'],
        status: 'upcoming',
      },
      {
        organizer: greenEarth._id,
        title: 'E-Waste Collection Camp',
        description: 'A one-day camp where residents can safely drop off old electronics for recycling. Volunteers assist with sorting, cataloging, and loading e-waste.',
        category: 'Environment',
        date: new Date(Date.now() + 86400000 * 16),
        time: '10:00 AM - 04:00 PM',
        location: 'Community Centre, Sector 35-B',
        locationType: 'in-person',
        volunteerSlots: 20,
        registeredCount: 8,
        hoursGranted: 6,
        banner: { url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Basic computer or electronics knowledge helpful'],
        skillsNeeded: ['Logistics', 'Sorting & Tagging'],
        status: 'upcoming',
      },
      {
        organizer: greenEarth._id,
        title: 'Urban Composting Workshop',
        description: 'Hands-on workshop teaching households how to compost kitchen waste. Learn to build low-cost compost bins and convert organic waste into rich soil nutrient.',
        category: 'Environment',
        date: new Date(Date.now() - 86400000 * 5),
        time: '11:00 AM - 02:00 PM',
        location: 'Rose Garden Community Pavilion',
        locationType: 'in-person',
        volunteerSlots: 30,
        registeredCount: 28,
        hoursGranted: 3,
        banner: { url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&auto=format&fit=crop&q=80' },
        status: 'completed',
        averageRating: 4.9,
        totalRatings: 15,
      },

      // --- Teach for India (Education) ---
      {
        organizer: teachIndia._id,
        title: 'Weekend Reading Circle',
        description: 'Volunteers read and discuss storybooks with primary-grade children. Help build English fluency, reading confidence, and imaginative skills.',
        category: 'Education',
        date: new Date(Date.now() + 86400000 * 4),
        time: '10:00 AM - 12:30 PM',
        location: 'Government Primary School, Phase 7, Mohali',
        locationType: 'in-person',
        volunteerSlots: 20,
        registeredCount: 16,
        hoursGranted: 3,
        banner: { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Good communication skills', 'Enthusiasm for reading with kids'],
        skillsNeeded: ['Storytelling', 'Reading Tutoring'],
        status: 'upcoming',
        isFeatured: true,
      },
      {
        organizer: teachIndia._id,
        title: 'Career Guidance Workshop',
        description: 'Session connecting high-school students with mentors from various professions including engineering, arts, commerce, healthcare, and law.',
        category: 'Education',
        date: new Date(Date.now() + 86400000 * 9),
        time: '02:00 PM - 05:00 PM',
        location: 'Auditorium, Govt Model Senior Secondary School, Sector 10',
        locationType: 'hybrid',
        volunteerSlots: 15,
        registeredCount: 10,
        hoursGranted: 4,
        banner: { url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Professional background in any field'],
        skillsNeeded: ['Mentorship', 'Career Counseling'],
        status: 'upcoming',
      },
      {
        organizer: teachIndia._id,
        title: 'Book & Stationery Donation Drive',
        description: 'Collecting books, notebooks, pens, and educational supplies for partner schools serving low-income families in Mohali and Chandigarh.',
        category: 'Education',
        date: new Date(Date.now() + 86400000 * 14),
        time: '09:00 AM - 03:00 PM',
        location: 'Teach For India Learning Hub, Mohali',
        locationType: 'in-person',
        volunteerSlots: 25,
        registeredCount: 14,
        hoursGranted: 5,
        banner: { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Help sorting and packing educational kits'],
        skillsNeeded: ['Inventory Management', 'Packaging'],
        status: 'upcoming',
      },
      {
        organizer: teachIndia._id,
        title: 'Digital Literacy Bootcamp',
        description: 'Introductory computer classes for students with limited tech access. Cover typing, searching safely online, email, and basic word processing.',
        category: 'Education',
        date: new Date(Date.now() + 86400000 * 18),
        time: '11:00 AM - 02:00 PM',
        location: 'Digital Lab, Sector 22 Computer Centre',
        locationType: 'in-person',
        volunteerSlots: 12,
        registeredCount: 9,
        hoursGranted: 4,
        banner: { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Basic computer proficiency'],
        skillsNeeded: ['Computer Basics', 'Teaching'],
        status: 'upcoming',
      },
      {
        organizer: teachIndia._id,
        title: 'Volunteer Tutor Orientation',
        description: 'Onboarding and training session for new volunteer tutors joining our weekend education initiative. Learn child-centric pedagogy and lesson structures.',
        category: 'Education',
        date: new Date(Date.now() - 86400000 * 8),
        time: '03:00 PM - 05:00 PM',
        location: 'Virtual Zoom Session',
        locationType: 'virtual',
        volunteerSlots: 50,
        registeredCount: 45,
        hoursGranted: 2,
        banner: { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80' },
        status: 'completed',
        averageRating: 4.8,
        totalRatings: 22,
      },

      // --- Red Cross Society (Crisis & Disaster Relief) ---
      {
        organizer: redCross._id,
        title: 'Blood Donation Camp',
        description: 'Community blood drive organized with local hospitals to replenish blood banks for trauma cases and surgery patients. Medical team on-site.',
        category: 'Crisis & Disaster Relief',
        date: new Date(Date.now() + 86400000 * 2),
        time: '09:00 AM - 04:00 PM',
        location: 'Red Cross Bhawan, Sector 11-B, Chandigarh',
        locationType: 'in-person',
        volunteerSlots: 30,
        registeredCount: 22,
        hoursGranted: 5,
        banner: { url: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Assisting donor registration and refreshment counters'],
        skillsNeeded: ['Registration Desk', 'Hospitality'],
        status: 'upcoming',
        isFeatured: true,
      },
      {
        organizer: redCross._id,
        title: 'First-Aid & CPR Training',
        description: 'Certified training session on basic first aid and emergency response led by senior medical professionals. Participants receive Red Cross certificate.',
        category: 'Crisis & Disaster Relief',
        date: new Date(Date.now() + 86400000 * 6),
        time: '10:00 AM - 03:00 PM',
        location: 'Red Cross Training Hall, Sector 11',
        locationType: 'in-person',
        volunteerSlots: 25,
        registeredCount: 19,
        hoursGranted: 5,
        banner: { url: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Punctuality required for certification eligibility'],
        skillsNeeded: ['First Aid Interest', 'Emergency Preparedness'],
        status: 'upcoming',
      },
      {
        organizer: redCross._id,
        title: 'Flood Relief Supply Packing',
        description: 'Volunteers pack essential-supply kits for flood-affected families containing dry ration, hygiene products, water purification tablets, and first-aid kits.',
        category: 'Crisis & Disaster Relief',
        date: new Date(Date.now() + 86400000 * 11),
        time: '08:30 AM - 01:30 PM',
        location: 'Red Cross Warehouse, Industrial Area Phase 1',
        locationType: 'in-person',
        volunteerSlots: 40,
        registeredCount: 29,
        hoursGranted: 5,
        banner: { url: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Stamina for assembly line packaging'],
        skillsNeeded: ['Supply Logistics', 'Packing'],
        status: 'upcoming',
      },
      {
        organizer: redCross._id,
        title: 'Disaster Preparedness Workshop',
        description: 'Session teaching households how to build an emergency plan, put together survival kits, and respond effectively during earthquakes or urban flooding.',
        category: 'Crisis & Disaster Relief',
        date: new Date(Date.now() + 86400000 * 15),
        time: '11:00 AM - 01:00 PM',
        location: 'Sector 34 Community Hall',
        locationType: 'hybrid',
        volunteerSlots: 30,
        registeredCount: 15,
        hoursGranted: 3,
        banner: { url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Distribute preparedness leaflets to attendees'],
        skillsNeeded: ['Event Assistance', 'Public Guidance'],
        status: 'upcoming',
      },
      {
        organizer: redCross._id,
        title: 'Winter Relief Blanket Distribution',
        description: 'Distribution drive providing blankets and warm clothing to those in need living in temporary shelters across the Tricity during severe winter conditions.',
        category: 'Crisis & Disaster Relief',
        date: new Date(Date.now() - 86400000 * 12),
        time: '06:00 PM - 09:00 PM',
        location: 'Night Shelters across Sector 17 & Railway Station',
        locationType: 'in-person',
        volunteerSlots: 30,
        registeredCount: 30,
        hoursGranted: 4,
        banner: { url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80' },
        status: 'completed',
        averageRating: 5.0,
        totalRatings: 20,
      },

      // --- Wildlife Society (Animal Welfare) ---
      {
        organizer: wildlifeSociety._id,
        title: 'Stray Animal Vaccination Camp',
        description: 'Free vaccination and health check-up camp for stray dogs and cats conducted with veterinary doctors. Helps prevent rabies and promotes animal health.',
        category: 'Animal Welfare',
        date: new Date(Date.now() + 86400000 * 5),
        time: '09:00 AM - 02:00 PM',
        location: 'Veterinary Clinic, Sector 4, Panchkula',
        locationType: 'in-person',
        volunteerSlots: 20,
        registeredCount: 15,
        hoursGranted: 5,
        banner: { url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Comfortable around animals', 'Assisting vet team'],
        skillsNeeded: ['Animal Handling', 'Record Keeping'],
        status: 'upcoming',
        isFeatured: true,
      },
      {
        organizer: wildlifeSociety._id,
        title: 'Pet Adoption Drive',
        description: 'Event connecting rescued animals with prospective adoptive families. Help arrange meet-and-greets, handle adoption paperwork, and promote pets.',
        category: 'Animal Welfare',
        date: new Date(Date.now() + 86400000 * 10),
        time: '11:00 AM - 04:00 PM',
        location: 'Town Park, Sector 5, Panchkula',
        locationType: 'in-person',
        volunteerSlots: 25,
        registeredCount: 16,
        hoursGranted: 5,
        banner: { url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Friendly attitude', 'Help managing puppy/kitten play pens'],
        skillsNeeded: ['Pet Care', 'Public Interaction'],
        status: 'upcoming',
      },
      {
        organizer: wildlifeSociety._id,
        title: 'Bird Nesting Box Workshop',
        description: 'Volunteers build and install nesting boxes in local green spaces to support urban bird populations such as sparrows, robins, and mynas.',
        category: 'Animal Welfare',
        date: new Date(Date.now() + 86400000 * 13),
        time: '10:00 AM - 01:00 PM',
        location: 'Fragrance Garden, Sector 36, Chandigarh',
        locationType: 'in-person',
        volunteerSlots: 20,
        registeredCount: 11,
        hoursGranted: 3,
        banner: { url: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Basic carpentry/DIY interest (tools provided)'],
        skillsNeeded: ['Crafting', 'Woodwork/Assembly'],
        status: 'upcoming',
      },
      {
        organizer: wildlifeSociety._id,
        title: 'Wildlife Habitat Clean-Up',
        description: 'Clearing debris, plastic, and invasive plants from a nearby wildlife habitat zone near Sukhna Wildlife Sanctuary buffer region.',
        category: 'Animal Welfare',
        date: new Date(Date.now() + 86400000 * 17),
        time: '07:00 AM - 10:30 AM',
        location: 'Sukhna Sanctuary Buffer Trail',
        locationType: 'in-person',
        volunteerSlots: 30,
        registeredCount: 17,
        hoursGranted: 4,
        banner: { url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200&auto=format&fit=crop&q=80' },
        requirements: ['Sturdy hiking shoes', 'Quiet decorum in nature reserve'],
        skillsNeeded: ['Environmental Cleanliness', 'Nature Trail Care'],
        status: 'upcoming',
      },
      {
        organizer: wildlifeSociety._id,
        title: 'Animal Welfare Awareness Seminar',
        description: 'Talk on responsible pet ownership, preventing animal cruelty, and living safely alongside local urban wildlife.',
        category: 'Animal Welfare',
        date: new Date(Date.now() - 86400000 * 10),
        time: '04:00 PM - 06:00 PM',
        location: 'Panchkula Library Hall',
        locationType: 'hybrid',
        volunteerSlots: 40,
        registeredCount: 38,
        hoursGranted: 2,
        banner: { url: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=1200&auto=format&fit=crop&q=80' },
        status: 'completed',
        averageRating: 4.7,
        totalRatings: 18,
      },
    ];

    const createdEvents = await Event.insertMany(eventsData);

    console.log('[Seed] Registering volunteers for events and generating certificates...');

    // Register volunteers to events
    const regPromises = [];
    const createdTreeDrive = createdEvents.find(e => e.title === 'Community Tree Plantation Drive');
    const createdReading = createdEvents.find(e => e.title === 'Weekend Reading Circle');
    const createdBloodDrive = createdEvents.find(e => e.title === 'Blood Donation Camp');
    const createdVaccination = createdEvents.find(e => e.title === 'Stray Animal Vaccination Camp');
    const createdComposting = createdEvents.find(e => e.title === 'Urban Composting Workshop');

    if (createdTreeDrive) {
      regPromises.push(
        EventRegistration.create({ event: createdTreeDrive._id, user: aarav._id, status: 'approved' }),
        EventRegistration.create({ event: createdTreeDrive._id, user: rohan._id, status: 'approved' }),
      );
    }
    if (createdReading) {
      regPromises.push(
        EventRegistration.create({ event: createdReading._id, user: ananya._id, status: 'approved' }),
      );
    }
    if (createdBloodDrive) {
      regPromises.push(
        EventRegistration.create({ event: createdBloodDrive._id, user: rohan._id, status: 'approved' }),
      );
    }
    if (createdVaccination) {
      regPromises.push(
        EventRegistration.create({ event: createdVaccination._id, user: priya._id, status: 'approved' }),
      );
    }

    if (createdComposting) {
      regPromises.push(
        EventRegistration.create({ event: createdComposting._id, user: aarav._id, status: 'attended', attended: true, checkInTime: new Date() }),
      );
      // Create Certificate for Aarav
      await Certificate.create({
        certificateCode: `CS-CERT-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        user: aarav._id,
        event: createdComposting._id,
        organization: greenEarth._id,
        volunteerName: aarav.name,
        eventTitle: createdComposting.title,
        organizationName: greenEarth.name,
        hours: 3,
        issueDate: new Date(),
        badgeAwarded: 'Eco Warrior Certificate',
      });
    }

    await Promise.all(regPromises);

    console.log('[Seed] Creating realistic social feed posts...');

    const postsData = [
      {
        author: greenEarth._id,
        content: "🌱 Exciting News! Our upcoming 'Community Tree Plantation Drive' is now open for volunteer registrations! Join us at Sukhna Lake Park as we plant over 200 native saplings. Let's make Chandigarh greener together!",
        tags: ['TreePlantation', 'SukhnaLake', 'GreenEarth'],
        location: 'Sukhna Lake Park, Sector 1',
        eventTag: createdTreeDrive?._id,
        likes: [aarav._id, ananya._id, rohan._id],
        sharesCount: 8,
        media: { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&auto=format&fit=crop&q=80', mediaType: 'image' },
      },
      {
        author: teachIndia._id,
        content: "📚 Books unlock infinite possibilities! This weekend's Reading Circle with primary school kids in Mohali was filled with bright smiles and inspiring stories. Thank you to all volunteer tutors!",
        tags: ['WeekendReading', 'TeachForIndia', 'EducationForAll'],
        location: 'Phase 7, Mohali',
        eventTag: createdReading?._id,
        likes: [ananya._id, priya._id],
        sharesCount: 5,
        media: { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&auto=format&fit=crop&q=80', mediaType: 'image' },
      },
      {
        author: redCross._id,
        content: "🩸 Every blood donation saves up to 3 lives! Join Red Cross Society at our Sector 11-B Blood Donation Camp this Saturday. Certified doctors and refreshments ready for all hero donors.",
        tags: ['BloodDonation', 'RedCross', 'SaveLives'],
        location: 'Sector 11-B, Chandigarh',
        eventTag: createdBloodDrive?._id,
        likes: [rohan._id, aarav._id, priya._id],
        sharesCount: 14,
        media: { url: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=900&auto=format&fit=crop&q=80', mediaType: 'image' },
      },
      {
        author: wildlifeSociety._id,
        content: "🐾 Protect your furry companions and street animals! Free Vaccination & Health Camp in Panchkula this week. Let's build a safe, rabies-free community together.",
        tags: ['StrayVaccination', 'AnimalWelfare', 'WildlifeSociety'],
        location: 'Sector 4, Panchkula',
        eventTag: createdVaccination?._id,
        likes: [priya._id, ananya._id],
        sharesCount: 9,
        media: { url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=900&auto=format&fit=crop&q=80', mediaType: 'image' },
      },
      {
        author: aarav._id,
        content: "Just completed the Urban Composting Workshop with @greenearth! Learned how simple kitchen scraps can turn into rich garden manure. Earned my volunteer certificate today! 🍃",
        tags: ['Composting', 'ZeroWaste', 'VolunteerImpact'],
        location: 'Sector 35, Chandigarh',
        eventTag: createdComposting?._id,
        likes: [greenEarth._id, rohan._id],
        sharesCount: 3,
        media: { url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&auto=format&fit=crop&q=80', mediaType: 'image' },
      },
      {
        author: ananya._id,
        content: "Looking forward to mentoring high school students at the Career Guidance Workshop! It's so rewarding to help young minds find their passion. Join us if you'd like to mentor! 🚀",
        tags: ['Mentorship', 'CareerGuidance'],
        location: 'Mohali',
        likes: [teachIndia._id, aarav._id],
        sharesCount: 2,
      },
    ];

    const createdPosts = await Post.insertMany(postsData);

    // Create a couple of sample comments
    await Comment.create({
      post: createdPosts[0]._id,
      author: aarav._id,
      content: "Already registered for the Sukhna Lake tree plantation drive! See you all there at 7:30 AM.",
    });
    await Comment.create({
      post: createdPosts[2]._id,
      author: rohan._id,
      content: "Will be assisting at the registration desk. Please bring a valid photo ID donors!",
    });

    console.log('===========================================================');
    console.log(' SUCCESS: Database successfully populated with real data!');
    console.log(' - 4 NGOs created from PDF (Green Earth, Teach India, Red Cross, Wildlife Society)');
    console.log(' - 20 Detailed Events created');
    console.log(' - 4 Sample Volunteers created (Aarav, Ananya, Rohan, Priya)');
    console.log(' - Registrations, Certificates, Posts, and Comments linked!');
    console.log('===========================================================');

    if (require.main === module) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed Error]', error);
    if (require.main === module) {
      await disconnectDB();
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedRealData();
}

module.exports = seedRealData;
