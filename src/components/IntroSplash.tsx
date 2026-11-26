import React, { useEffect, useState } from 'react';
import { FastForward, Sparkles } from 'lucide-react';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    let fadeTimer = 0;
    let doneTimer = 0;
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        fadeTimer = window.setTimeout(() => {
          setFadingOut(true);
        }, 3400);
        doneTimer = window.setTimeout(() => {
          onComplete();
        }, 3900);
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFadingOut(true);
    window.setTimeout(() => {
      onComplete();
    }, 220);
  };

  return (
    <div
      data-testid="intro-splash"
      dir="rtl"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 42%, #241910 0%, #110d09 55%, #070504 100%)',
      }}
    >
      {/* Subtle geometric studio grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(245, 180, 0, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(34, 211, 238, 0.12) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Animated Vortex Studio Crest */}
      <div className="relative flex flex-col items-center text-center px-6 max-w-2xl">
        <div className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center mb-6">
          {/* Outer rotating orbital ring */}
          <svg
            viewBox="0 0 180 180"
            className="absolute inset-0 w-full h-full vortex-spin-cw"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="vortexOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5b400" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke="url(#vortexOuter)"
              strokeWidth="3.5"
              strokeDasharray="110 38 45 28"
              strokeLinecap="round"
            />
          </svg>

          {/* Inner counter-rotating orbital ring */}
          <svg
            viewBox="0 0 180 180"
            className="absolute inset-3 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] vortex-spin-ccw"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="vortexInner" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <circle
              cx="90"
              cy="90"
              r="72"
              fill="none"
              stroke="url(#vortexInner)"
              strokeWidth="2.5"
              strokeDasharray="70 30 22 30"
              strokeLinecap="round"
            />
          </svg>

          {/* Center VORTEX Emblem */}
          <div
            className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-amber-400/70 flex items-center justify-center shadow-2xl"
            style={{
              background:
                'linear-gradient(145deg, rgba(245, 180, 0, 0.2), rgba(14, 116, 144, 0.28))',
            }}
          >
            <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
              <path
                d="M12 16 L32 50 L52 16 L43 16 L32 36 L21 16 Z"
                fill="#fbbf24"
              />
              <path
                d="M22 14 L32 31 L42 14"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Studio Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/45 bg-cyan-950/50 text-cyan-300 text-xs font-extrabold tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>VORTEX DIGITAL STUDIO PRESENTS</span>
        </div>

        {/* Main Requested Credit */}
        <h1
          data-testid="intro-developer-credit"
          dir="rtl"
          className="vortex-reveal font-display font-black text-3xl sm:text-5xl md:text-6xl leading-tight text-white drop-shadow-lg"
        >
          <span className="text-amber-400">تطوير </span>
          <span className="text-cyan-300 tracking-wider">VORTEXweblab</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base md:text-lg font-bold text-stone-300">
          يقدّم تجربة العالم المفتوح المصرية —{' '}
          <span className="text-amber-300">محاكي المعلم · ELMOALEM SIMULATOR</span>
        </p>

        {/* Animated Loading Bar */}
        <div className="mt-7 w-64 sm:w-80 h-1.5 rounded-full bg-stone-800/90 overflow-hidden border border-stone-700/60">
          <div
            className="h-full rounded-full vortex-bar-fill"
            style={{
              background: 'linear-gradient(90deg, #22d3ee 0%, #f5b400 100%)',
            }}
          />
        </div>

        <button
          type="button"
          data-testid="intro-skip-btn"
          onClick={handleSkip}
          className="mt-7 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/40 bg-stone-900/90 hover:bg-stone-800 text-amber-200 text-xs font-extrabold cursor-pointer transition-colors"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>تخطي الإنترو والدخول فوراً</span>
        </button>
      </div>
    </div>
  );
};
