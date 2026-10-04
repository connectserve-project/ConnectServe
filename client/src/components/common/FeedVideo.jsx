import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';

/**
 * Instagram-style feed video.
 *  - Autoplays (with sound) when it scrolls into view, loops, no native controls
 *  - ONLY ONE video plays at a time: the most visible one. Every other video
 *    is paused AND muted.
 *  - Single click -> pause / resume
 *  - Double click -> mute / unmute (choice is shared by all videos)
 */

const MIN_VISIBLE = 0.6; // how much of a video must be visible to become active

// ---------------- shared mute state ----------------
let globalMuted = false; // videos autoplay WITH sound
const muteListeners = new Set();
const setGlobalMuted = (value) => {
  globalMuted = value;
  muteListeners.forEach((fn) => fn(value));
};

// Browsers block autoplay-with-sound until the user interacts with the page.
// If blocked we start muted, then unmute on the next click / tap / key press.
let unmuteArmed = false;
const armUnmuteOnInteraction = () => {
  if (unmuteArmed) return;
  unmuteArmed = true;
  const events = ['pointerdown', 'touchstart', 'keydown'];
  const handler = () => {
    events.forEach((e) => document.removeEventListener(e, handler, true));
    unmuteArmed = false;
    setGlobalMuted(false);
  };
  events.forEach((e) => document.addEventListener(e, handler, true));
};

// ---------------- single active player registry ----------------
const registry = new Map(); // id -> { el, video, ratio, userPaused, setActive }
let manualActiveId = null; // video the user explicitly resumed
let idCounter = 0;

const reconcile = () => {
  // 1) choose the active video
  let activeId = null;

  const manual = manualActiveId && registry.get(manualActiveId);
  if (manual && manual.ratio >= 0.3) {
    activeId = manualActiveId;
  } else {
    manualActiveId = null;
    let bestRatio = 0;
    let bestTop = Infinity;
    registry.forEach((entry, id) => {
      if (entry.ratio >= MIN_VISIBLE) {
        const top = entry.el.getBoundingClientRect().top;
        if (entry.ratio > bestRatio + 0.05 || (Math.abs(entry.ratio - bestRatio) <= 0.05 && top < bestTop)) {
          activeId = id;
          bestRatio = entry.ratio;
          bestTop = top;
        }
      }
    });
  }

  // 2) active one plays (unless the user paused it); everything else pauses + mutes
  registry.forEach((entry, id) => {
    const v = entry.video;
    if (!v) return;
    if (id === activeId) {
      entry.setActive(true);
      v.muted = globalMuted;
      if (!entry.userPaused && v.paused) entry.play();
    } else {
      entry.setActive(false);
      v.muted = true;
      if (!v.paused) v.pause();
    }
  });
};

export const isVideoMedia = (media) =>
  !!media?.url &&
  (media.mediaType === 'video' ||
    /\.(mp4|mov|mkv|webm)(\?|$)/i.test(media.url) ||
    media.url.startsWith('data:video/'));

export const FeedVideo = ({ src, className = '', videoClassName = 'w-full h-full object-cover' }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const clickTimer = useRef(null);
  const feedbackTimer = useRef(null);
  const entryRef = useRef(null);
  const idRef = useRef(`fv_${++idCounter}`);

  const [muted, setMuted] = useState(globalMuted);
  const [isActive, setIsActive] = useState(false);
  const [paused, setPaused] = useState(true);
  const [feedback, setFeedback] = useState(null); // 'play' | 'pause' | 'mute' | 'unmute'

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = globalMuted;
    const p = v.play();
    if (p && p.catch) {
      p.catch(() => {
        // autoplay with sound blocked -> play muted, unmute on first interaction
        v.muted = true;
        setGlobalMuted(true);
        v.play().catch(() => {});
        armUnmuteOnInteraction();
      });
    }
  }, []);

  // register in the shared registry + watch visibility
  useEffect(() => {
    const el = containerRef.current;
    const id = idRef.current;
    if (!el) return undefined;

    const entry = {
      el,
      video: videoRef.current,
      ratio: 0,
      userPaused: false,
      setActive: setIsActive,
      play,
    };
    entryRef.current = entry;
    registry.set(id, entry);

    const observer = new IntersectionObserver(
      ([e]) => {
        entry.ratio = e.isIntersecting ? e.intersectionRatio : 0;
        reconcile();
      },
      { threshold: [0, 0.1, 0.3, 0.5, 0.6, 0.75, 0.9, 1] }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      registry.delete(id);
      if (manualActiveId === id) manualActiveId = null;
      reconcile();
    };
  }, [play]);

  // keep mute state in sync (only the active video is ever audible)
  useEffect(() => {
    const fn = (value) => {
      setMuted(value);
      const v = videoRef.current;
      if (v) v.muted = entryRef.current && isActiveRef.current ? value : true;
    };
    muteListeners.add(fn);
    return () => muteListeners.delete(fn);
  }, []);

  const isActiveRef = useRef(false);
  useEffect(() => {
    isActiveRef.current = isActive;
    if (videoRef.current) videoRef.current.muted = isActive ? muted : true;
  }, [isActive, muted]);

  // pause when tab hidden, resume active one when visible again
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) videoRef.current?.pause();
      else reconcile();
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
    const entry = entryRef.current;
    if (!v || !entry) return;
    if (v.paused) {
      entry.userPaused = false;
      manualActiveId = idRef.current; // user chose this one -> it becomes the only active video
      reconcile();
      if (v.paused) play();
      flash('play');
    } else {
      entry.userPaused = true;
      v.pause();
      flash('pause');
    }
  };

  const toggleMute = () => {
    const next = !globalMuted;
    setGlobalMuted(next);
    flash(next ? 'mute' : 'unmute');
  };

  // single click = pause/resume, double click = mute/unmute
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

  const showMuted = muted || !isActive;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative bg-black overflow-hidden cursor-pointer select-none ${className}`}
    >
      <video
        ref={(node) => {
          videoRef.current = node;
          if (entryRef.current) entryRef.current.video = node;
        }}
        src={src}
        className={videoClassName}
        muted
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

      {/* Mute badge */}
      <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center pointer-events-none">
        {showMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
      </div>
    </div>
  );
};

export default FeedVideo;
