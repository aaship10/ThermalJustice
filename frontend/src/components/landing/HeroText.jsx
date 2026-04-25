import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HeroText() {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const sublineRef = useRef(null);
  const wordmarkRef = useRef(null);

  useEffect(() => {
    // Wordmark entrance
    gsap.fromTo(wordmarkRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.8, ease: 'power2.out' }
    );

    // Headline entrance
    gsap.fromTo(headlineRef.current,
      { opacity: 0, y: 40, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' }
    );

    // Subline entrance
    gsap.fromTo(sublineRef.current,
      { opacity: 0, y: 40, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, delay: 0.3, ease: 'power3.out' }
    );

    // Fade out everything on scroll
    const trigger = ScrollTrigger.create({
      trigger: '#frame-scrub-section',
      start: 'top top',
      end: '15% top',
      scrub: true,
      animation: gsap.to(containerRef.current, { autoAlpha: 0, y: -50 })
    });

    return () => trigger.kill();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-screen h-screen z-10 pointer-events-none"
    >
      {/* Wordmark (Top Left) */}
      <div
        ref={wordmarkRef}
        className="liquid-glass-nav absolute top-24 left-8 inline-flex w-fit flex-col gap-1 rounded-[999px]"
        style={{ padding: '16px 24px' }}
      >
        <span className="font-semibold text-white text-[18px] font-display">ThermalJustice</span>
        <span className="text-[12px] text-white/50 tracking-[0.15em] uppercase font-display">Heat Intervention Intelligence</span>
      </div>

      {/* Background Gradient overlay for text readability */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[40%]" 
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)' }}
      />

      {/* Main Text Container */}
      <div className="absolute bottom-0 left-0 w-full h-[40%] flex flex-col items-center justify-center text-center px-4">
        <h1
          ref={headlineRef}
          className="text-6xl md:text-[96px] font-extrabold text-white mb-6 leading-tight"
          style={{ 
            fontFamily: 'var(--font-display)',
            textShadow: '0 2px 40px rgba(0,0,0,0.8)'
          }}
        >
          Pune is burning.
        </h1>
        <p
          ref={sublineRef}
          className="text-xl md:text-[22px] font-normal text-white/75 max-w-3xl leading-relaxed"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
        >
          Street-level temperatures exceed 48°C in Pune's poorest neighborhoods.
        </p>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 flex flex-col items-center gap-2">
          <div
            className="liquid-glass inline-flex w-fit items-center justify-center rounded-[999px]"
            style={{ padding: '14px 22px' }}
          >
            <span className="text-[11px] uppercase tracking-[0.1em] text-white/50">
              scroll to witness the difference
            </span>
          </div>
          <div className="animate-scroll-indicator text-white/50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
