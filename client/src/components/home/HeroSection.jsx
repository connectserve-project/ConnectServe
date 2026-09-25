import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { Sparkles, ChevronLeft, ChevronRight, UserPlus, Rss } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const heroPhotos = [
  {
    url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1000&auto=format&fit=crop&q=80',
    alt: 'Volunteers participating in beach & river cleanup',
    caption: 'Environmental Cleanup Drive',
  },
  {
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80',
    alt: 'Tree plantation drive with community volunteers',
    caption: 'Tree Plantation Drive',
  },
  {
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1000&auto=format&fit=crop&q=80',
    alt: 'Volunteers teaching children in underserved communities',
    caption: 'Education & Mentorship',
  },
  {
    url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1000&auto=format&fit=crop&q=80',
    alt: 'Animal welfare and adoption drive volunteers',
    caption: 'Animal Care & Rescue',
  },
  {
    url: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=1000&auto=format&fit=crop&q=80',
    alt: 'Disaster relief and essential supplies packing',
    caption: 'Relief & Emergency Support',
  },
];

export const HeroSection = () => {
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroPhotos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroPhotos.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroPhotos.length) % heroPhotos.length);

  return (
    <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-mesh bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card w-full">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 p-5 sm:p-10 lg:p-14 items-center">
        {/* Copy column */}
        <div className="space-y-5 sm:space-y-6 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-slate-900 dark:text-white">
            Connect With Your Community.{' '}
            <span className="text-gradient-ocean">Create Real Impact.</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Discover people, conversations, communities and opportunities around you — then turn connection into action.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            {isAuthenticated ? (
              <Link to="/feed" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" icon={Rss} className="w-full sm:w-auto sm:min-w-[190px]">
                  Go To Feed
                </Button>
              </Link>
            ) : (
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" icon={UserPlus} className="w-full sm:w-auto sm:min-w-[190px]">
                  Join Now
                </Button>
              </Link>
            )}
            <Link to="/events" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" icon={Sparkles} className="w-full sm:w-auto sm:min-w-[190px]">
                Find Opportunities
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual column: Automatic photo slider without floating text */}
        <div className="relative h-72 sm:h-96 lg:h-[28rem] w-full group">
          <div className="absolute inset-0 rounded-[1.75rem] overflow-hidden shadow-float-card border border-white/40 dark:border-slate-800">
            {heroPhotos.map((photo, idx) => (
              <div
                key={photo.url}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                
                {/* Photo Tag/Caption */}
                <div className="absolute bottom-4 left-4 sm:left-6 z-20">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-slate-950/70 backdrop-blur-md border border-white/20 shadow-md">
                    {photo.caption}
                  </span>
                </div>
              </div>
            ))}

            {/* Slider Navigation Buttons */}
            <button
              onClick={prevSlide}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-950/40 hover:bg-slate-950/70 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-950/40 hover:bg-slate-950/70 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 right-4 sm:right-6 z-30 flex items-center gap-1.5">
              {heroPhotos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ambient gradient blobs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-64 h-64 rounded-full bg-violet-400/15 blur-3xl pointer-events-none" />
    </section>
  );
};
