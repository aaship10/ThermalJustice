import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function StatCounters() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const v1Ref = useRef(null);
  const v2Ref = useRef(null);
  const v3Ref = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    ).fromTo(
      '.stat-card',
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'back.out(1.7)',
        stagger: 0.15,
      },
      '-=0.3'
    );

    const countTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 60%',
      onEnter: () => {
        gsap.to(v1Ref.current, { innerHTML: 48, duration: 2, ease: 'power2.out', snap: { innerHTML: 1 } });
        gsap.to(v2Ref.current, { innerHTML: 14, duration: 2, ease: 'power2.out', snap: { innerHTML: 1 }, delay: 0.2 });
        gsap.to(v3Ref.current, { innerHTML: 2500, duration: 2.5, ease: 'power2.out', snap: { innerHTML: 1 }, delay: 0.4 });
      },
    });

    return () => {
      tl.kill();
      countTrigger.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="stats-section landing-glass-section relative z-20 flex min-h-screen items-center justify-center px-6 py-24 md:px-8 md:py-32"
      style={{
        backgroundColor: 'rgba(6, 13, 24, 0.34)',
        backgroundImage:
          'linear-gradient(180deg, rgba(6,13,24,0.14) 0%, rgba(6,13,24,0.54) 100%), radial-gradient(ellipse at 50% 0%, rgba(13,148,136,0.14) 0%, transparent 60%)',
      }}
    >
      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-12 md:gap-16">
        <h2
          ref={titleRef}
          className="text-center text-4xl font-bold text-white md:text-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          The scale of the crisis.
        </h2>

        <div className="flex w-full flex-col gap-6 md:flex-row md:gap-8">
          <div className="stat-card liquid-glass-dark flex min-h-[240px] flex-1 flex-col items-center justify-center p-8 text-center">
            <div
              className="mb-2 text-[72px] font-extrabold"
              style={{ color: '#F46D43', textShadow: '0 0 40px currentColor', fontFamily: 'var(--font-mono)' }}
            >
              <span ref={v1Ref}>0</span>&deg;C
            </div>
            <div className="mb-2 font-body text-[13px] uppercase tracking-[0.1em] text-white/55">
              Peak surface
            </div>
            <div className="font-body text-[16px] text-white/80">
              temperature in Yerawada, Pune
            </div>
          </div>

          <div className="stat-card liquid-glass-dark flex min-h-[240px] flex-1 flex-col items-center justify-center p-8 text-center">
            <div
              className="mb-2 text-[72px] font-extrabold"
              style={{ color: '#FEE090', textShadow: '0 0 40px currentColor', fontFamily: 'var(--font-mono)' }}
            >
              <span ref={v2Ref}>0</span>&deg;C
            </div>
            <div className="mb-2 font-body text-[13px] uppercase tracking-[0.1em] text-white/55">
              Temperature gap
            </div>
            <div className="font-body text-[16px] text-white/80">
              between richest and poorest areas
            </div>
          </div>

          <div className="stat-card liquid-glass-dark flex min-h-[240px] flex-1 flex-col items-center justify-center p-8 text-center">
            <div
              className="mb-2 text-[72px] font-extrabold"
              style={{ color: '#D73027', textShadow: '0 0 40px currentColor', fontFamily: 'var(--font-mono)' }}
            >
              <span ref={v3Ref}>0</span>+
            </div>
            <div className="mb-2 font-body text-[13px] uppercase tracking-[0.1em] text-white/55">
              Deaths in 2015
            </div>
            <div className="font-body text-[16px] text-white/80">
              Andhra Pradesh heatwave
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
