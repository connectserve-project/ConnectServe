import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';

/**
 * Instagram-style feed video.
 *  - Auto plays (with sound) when it scrolls into view, pauses when it leaves view
 *  - Loops
 *  - No native controls
 *  - Single click  -> pause / resume
 *  - Double click  -> mute / unmute
 *  - Mute choice is shared by every video on the page (like Instagram)
 */

// ---- shared mute state (so unmuting one video keeps the next one unmuted) ----
let globalMuted = false; // videos autoplay WITH sound
const listeners = new Set();
const setGlobalMuted = (value) => {
  globalMuted = value;
  listeners.forEach((fn) => fn(value));
};

// Browsers block autoplay-with-sound until the user has interacted with the
// page. If that happens we start muted, then unmute on the very next
// click / tap / key press anywhere on the page.
let unmuteOnInteractionArmed = false;
const armUnmuteOnInteraction = () => {
  if (unmuteOnInteractionArmed) return;
  unmuteOnInteractionArmed = true;
  const events = ['pointerdown', 'touchstart', 'keydown'];
  const handler = () => {
    events.forEach((e) => document.removeEventListener(e, handler, true));
    unmuteOnInteractionArmed = false;
    setGlobalMuted(false);
  };
  events.forEach((e) => document.addEventListener(e, handler, true));
};

export const isVideoMedia = (media) =>
  !!media?.url && (media.mediaType === 'video' || /\.(mp4|mov|mkv|webm)(\?|$)/i.test(media.url) || media.url.startsWith('data:video/'));

export const FeedVideo = ({
  src,
  className = '',
  videoClassName = 'w-full h-full object-cover',
  threshold = 0.6,
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const clickTimer = useRef(null);
  const userPaused = useRef(false);
  const feedbackTimer = useRef(null);

  const [muted, setMuted] = useState(globalMuted);
  const [paused, setPaused] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'play' | 'pause' | 'mute' | 'unmute'

  // keep in sync with the shared mute state
  useEffect(() => {
    const fn = (value) => setMuted(value);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && p.catch) {
      p.catch(() => {
        // Browser blocked autoplay with sound -> play muted for now and
        // unmute automatically on the user's first interaction
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
        armUnmuteOnInteraction();
      });
    }
  }, []);

  // Autoplay when visible, pause when scrolled away
  useEffect(() => {
    const el = containerRef.current;
    const v = videoRef.current;
    if (!el || !v) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          if (!userPaused.current) play();
        } else {
          v.pause();
        }
      },
      { threshold: [0, threshold, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [play, threshold]);

  // Pause when the tab is hidden
  useEffect(() => {
    const onVisibility = () => {
      const v = videoRef.current;
      if (!v) return;
      if (document.hidden) v.pause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(clickTimer.current);
      clearTimeout(feedbackTimer.current);
    },
    []
  );

  const flash = (type) => {
    setFeedback(type);
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 700);
  };

  const togglePlayback = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      play();
      flash('play');
    } else {
      userPaused.current = true;
      v.pause();
      flash('pause');
    }
  };

  const toggleMute = () => {
    const next = !globalMuted;
    setGlobalMuted(next);
    flash(next ? 'mute' : 'unmute');
  };

  // Single click = pause/resume, double click = mute/unmute
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      toggleMute();
      return;
    }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      togglePlayback();
    }, 250);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative bg-black overflow-hidden cursor-pointer select-none ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        className={videoClassName}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        onContextMenu={(e) => e.preventDefault()}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      />

      {/* Persistent paused indicator */}
      {paused && !feedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Brief feedback bubble after click / double click */}
      {feedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center animate-fadeIn">
            {feedback === 'play' && <Play className="w-8 h-8 text-white fill-white ml-1" />}
            {feedback === 'pause' && (
              <div className="flex gap-1.5">
                <span className="w-2 h-7 bg-white rounded-sm" />
                <span className="w-2 h-7 bg-white rounded-sm" />
              </div>
            )}
            {feedback === 'mute' && <VolumeX className="w-8 h-8 text-white" />}
            {feedback === 'unmute' && <Volume2 className="w-8 h-8 text-white" />}
          </div>
        </div>
      )}

      {/* Small mute badge (bottom-right), like Instagram */}
      <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center pointer-events-none">
        {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
      </div>
    </div>
  );
};

export default FeedVideo;
