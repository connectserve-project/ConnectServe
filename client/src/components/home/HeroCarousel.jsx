import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides } from '../../data/homeMockData';

export const HeroCarousel = () => {
  const [active, setActive] = useState(0);

  const next = useCallback(() => setActive((a) => (a + 1) % heroSlides.length), []);
  const prev = () => setActive((a) => (a - 1 + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative rounded-[2rem] overflow-hidden shadow-card border border-slate-200 dark:border-slate-800 h-64 sm:h-80 lg:h-[22rem] w-full group">
      {heroSlides.map((slide, idx) => (
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
        {heroSlides.map((slide, idx) => (
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
