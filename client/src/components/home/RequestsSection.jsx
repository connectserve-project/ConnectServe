import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, HandHeart } from 'lucide-react';
import { communityRequests } from '../../data/homeMockData';

const RequestCard = ({ request }) => {
  const [responded, setResponded] = useState(false);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-card hover-glow space-y-3">
      <div className="flex items-center gap-2.5">
        <img
          src={request.author.avatar}
          alt={request.author.name}
          className="w-9 h-9 rounded-full object-cover"
          loading="lazy"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <div>
          <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{request.author.name}</p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {request.location}
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">"{request.text}"</p>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400">{request.responders + (responded ? 1 : 0)} people can help</span>
        <button
          onClick={() => setResponded((v) => !v)}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
            responded
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              : 'bg-gradient-to-r from-coral-500 to-orange-400 text-white shadow-md shadow-coral-500/25 hover:shadow-lg'
          }`}
        >
          <HandHeart className="w-3.5 h-3.5" />
          {responded ? "I'm in ✓" : 'I can help'}
        </button>
      </div>
    </div>
  );
};

export const RequestsSection = () => {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Your community needs you.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real, small asks from neighbors — the kind you can actually help with.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {communityRequests.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>

      <div className="text-center pt-1">
        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-coral-500 hover:translate-x-0.5 transition-transform"
        >
          See more requests near you →
        </Link>
      </div>
    </section>
  );
};
