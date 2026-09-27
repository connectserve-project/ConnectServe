import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// A transparent, white-bordered button used only on colorful CTA backgrounds
// where Button's built-in `outline` variant (teal-tinted) would clash.
const GhostOnColor = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center justify-center gap-2 w-full sm:min-w-[190px] px-6 py-2.5 rounded-xl border-2 border-white/70 text-white font-semibold text-base hover:bg-white/10 transition-all active:scale-[0.97] min-h-[42px]">
    {Icon && <Icon className="w-4 h-4" />}
    <span>{children}</span>
  </span>
);

const FilledOnColor = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center justify-center gap-2 w-full sm:min-w-[190px] px-6 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-base shadow-lg hover:bg-white/90 transition-all active:scale-[0.97] min-h-[42px]">
    {Icon && <Icon className="w-4 h-4" />}
    <span>{children}</span>
  </span>
);

export const FinalCTASection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-berry p-8 sm:p-14 text-white text-center shadow-2xl">
      <div className="relative z-10 max-w-2xl mx-auto space-y-5">
        <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
          Your community is already happening.
        </h2>
        <p className="text-sm sm:text-lg text-white/90">
          Join the conversation. Meet people nearby. Make something happen.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/communities" className="w-full sm:w-auto">
            <FilledOnColor icon={Compass}>Explore Community</FilledOnColor>
          </Link>

          {!isAuthenticated && (
            <Link to="/register" className="w-full sm:w-auto">
              <GhostOnColor icon={UserPlus}>Create Account</GhostOnColor>
            </Link>
          )}
        </div>
      </div>

      {/* Decorative floating shapes */}
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl animate-float pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-white/10 blur-2xl animate-floatSlow pointer-events-none" />
    </section>
  );
};
