import React, { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { HeroSection } from '../components/home/HeroSection';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { FeedSection } from '../components/home/FeedSection';
import { CommunitiesSection } from '../components/home/CommunitiesSection';
import { ActivitiesSection } from '../components/home/ActivitiesSection';
import { ImpactSection } from '../components/home/ImpactSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { FinalCTASection } from '../components/home/FinalCTASection';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Reveal = ({ children, className = '' }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
};

export const Home = () => {
  const [liveEvents, setLiveEvents] = useState([]);
  const [livePosts, setLivePosts] = useState([]);
  const [liveOrganizations, setLiveOrganizations] = useState([]);
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, postsRes, orgsRes, statsRes] = await Promise.allSettled([
          eventService.getEvents({ limit: 6, sortBy: 'date_asc' }),
          postService.getExplore({ limit: 6 }),
          userService.searchUsers({ role: 'organization', limit: 8 }),
          eventService.getPublicStats(),
        ]);

        if (eventsRes.status === 'fulfilled' && eventsRes.value?.success) {
          setLiveEvents(eventsRes.value.data?.events || []);
        }

        if (postsRes.status === 'fulfilled' && postsRes.value?.success) {
          setLivePosts(postsRes.value.data?.posts || []);
        }

        if (orgsRes.status === 'fulfilled' && orgsRes.value?.success) {
          setLiveOrganizations(orgsRes.value.data?.users || []);
        }

        if (statsRes.status === 'fulfilled' && statsRes.value?.success && statsRes.value?.data) {
          const { activeVolunteers, hoursLogged, drivesCompleted, verifiedNGOs } = statsRes.value.data;
          setLiveStats([
            { value: activeVolunteers ?? 0, suffix: '+', label: 'participants' },
            { value: drivesCompleted ?? 0, suffix: '', label: 'activities' },
            { value: hoursLogged ?? 0, suffix: '', label: 'community hours' },
            { value: verifiedNGOs ?? 0, suffix: '+', label: 'NGOs & communities' },
          ]);
        }

        // Log any individual failures so silent fallbacks to mock data are visible
        [eventsRes, postsRes, orgsRes, statsRes].forEach((res, i) => {
          const label = ['events', 'posts', 'organizations', 'stats'][i];
          if (res.status === 'rejected') {
            console.error(`Home: failed to load ${label}`, res.reason);
          } else if (res.value && res.value.success === false) {
            console.error(`Home: ${label} request returned success:false`, res.value);
          }
        });
      } catch (err) {
        console.error('Home: fetchData failed', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10 sm:space-y-16 pb-12 animate-fadeIn">
      <HeroSection />

      <Reveal>
        <HeroCarousel />
      </Reveal>

      <Reveal>
        <FeedSection livePosts={livePosts} />
      </Reveal>

      <Reveal>
        <CommunitiesSection liveOrganizations={liveOrganizations} />
      </Reveal>

      <Reveal>
        <ActivitiesSection liveEvents={liveEvents} />
      </Reveal>

      <Reveal>
        <ImpactSection liveStats={liveStats} />
      </Reveal>

      <Reveal>
        <TestimonialsSection />
      </Reveal>

      <Reveal>
        <FinalCTASection />
      </Reveal>
    </div>
  );
};
