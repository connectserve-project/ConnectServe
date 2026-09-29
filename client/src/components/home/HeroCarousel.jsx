import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    tag: 'Community Action',
    title: 'Empowering Communities, Connecting Causes.',
    body: 'ConnectServe links passionate volunteers with verified NGOs to drive real impact in Education, Environment, Crisis Relief & Animal Welfare.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&auto=format&fit=crop&q=80',
    accent: 'from-violet-600/70 to-pink-500/30',
  },
  {
    id: 2,
    tag: 'Education Drive',
    title: 'Every Child Deserves A Chance To Learn.',
    body: 'Tutors and mentors are needed across our after-school learning programs. Bring your time, bring your skills.',
    image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1400&auto=format&fit=crop&q=80',
    accent: 'from-emerald-600/70 to-teal-500/30',
  },
  {
    id: 3,
    tag: 'Environmental Action',
    title: 'Restore Our Coastline, One Shore At A Time.',
    body: 'Join local volunteers this weekend for a hands-on cleanup drive along the riverside and coastal trails.',
    image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=1400&auto=format&fit=crop&q=80',
    accent: 'from-teal-600/70 to-emerald-500/30',
  },
  {
    id: 4,
    tag: 'Food Relief',
    title: 'No One Should Go To Bed Hungry.',
    body: 'Help pack and distribute meals to families in underserved neighborhoods across the community.',
    image: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=1400&auto=format&fit=crop&q=80',
    accent: 'from-coral-500/70 to-orange-400/30',
  },
];

export const HeroCarousel = () => {
  const [active, setActive] = useState(0);

  const next = useCallback(() => setActive((a) => (a + 1) % slides.length), []);
  const prev = () => setActive((a) => (a - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative rounded-[2rem] overflow-hidden shadow-card border border-slate-200 dark:border-slate-800 h-64 sm:h-80 lg:h-[22rem] w-full group">
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${idx === active ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${slide.accent} opacity-40`} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

          <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 max-w-lg">
            <span className={`inline-flex w-fit items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white bg-gradient-to-r ${slide.accent} mb-3 shadow-md`}>
              {slide.tag}
            </span>
            <h3 className="font-display text-xl sm:text-3xl font-extrabold text-white leading-tight mb-1.5">
              {slide.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{slide.body}</p>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prev}
        aria-label="Previous story"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next story"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 right-5 sm:right-8 z-20 flex items-center gap-1.5">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setActive(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === active ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
              }`}
          />
        ))}
      </div>
    </section>
  );
};
