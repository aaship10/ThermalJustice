import React, { useRef, useEffect } from 'react';
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

    // Entrance animation for title and cards
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      }
    });

    tl.fromTo(titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
    .fromTo('.stat-card',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)', stagger: 0.15 },
      "-=0.3"
    );

    // Number counting animations
    const countTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 60%',
      onEnter: () => {
        gsap.to(v1Ref.current, { innerHTML: 48, duration: 2, ease: 'power2.out', snap: { innerHTML: 1 } });
        gsap.to(v2Ref.current, { innerHTML: 14, duration: 2, ease: 'power2.out', snap: { innerHTML: 1 }, delay: 0.2 });
        gsap.to(v3Ref.current, { innerHTML: 2500, duration: 2.5, ease: 'power2.out', snap: { innerHTML: 1 }, delay: 0.4 });
      }
    });

    return () => {
      tl.kill();
      countTrigger.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="stats-section relative flex flex-col items-center justify-center min-h-screen px-8"
      style={{
        background: '#060d18',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(13,148,136,0.12) 0%, transparent 60%)',
      }}
    >
      <h2
        ref={titleRef}
        className="text-4xl md:text-5xl font-bold text-white mb-16 text-center"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        The scale of the crisis.
      </h2>

      <div className="flex flex-col md:flex-row gap-6 max-w-5xl w-full">
        {/* Stat Card 1 */}
        <div className="stat-card liquid-glass-dark flex-1 p-8 text-center flex flex-col items-center justify-center min-h-[240px]">
          <div
            className="text-[72px] font-extrabold mb-2"
            style={{ color: '#F46D43', textShadow: '0 0 40px currentColor', fontFamily: 'var(--font-mono)' }}
          >
            <span ref={v1Ref}>0</span>°C
          </div>
          <div className="text-[13px] text-white/55 uppercase tracking-[0.1em] mb-2 font-body">
            Peak surface
          </div>
          <div className="text-[16px] text-white/80 font-body">
            temperature in Yerawada, Pune
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="stat-card liquid-glass-dark flex-1 p-8 text-center flex flex-col items-center justify-center min-h-[240px]">
          <div
            className="text-[72px] font-extrabold mb-2"
            style={{ color: '#FEE090', textShadow: '0 0 40px currentColor', fontFamily: 'var(--font-mono)' }}
          >
            <span ref={v2Ref}>0</span>°C
          </div>
          <div className="text-[13px] text-white/55 uppercase tracking-[0.1em] mb-2 font-body">
            Temperature gap
          </div>
          <div className="text-[16px] text-white/80 font-body">
            between richest & poorest areas
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="stat-card liquid-glass-dark flex-1 p-8 text-center flex flex-col items-center justify-center min-h-[240px]">
          <div
            className="text-[72px] font-extrabold mb-2"
            style={{ color: '#D73027', textShadow: '0 0 40px currentColor', fontFamily: 'var(--font-mono)' }}
          >
            <span ref={v3Ref}>0</span>+
          </div>
          <div className="text-[13px] text-white/55 uppercase tracking-[0.1em] mb-2 font-body">
            Deaths in 2015
          </div>
          <div className="text-[16px] text-white/80 font-body">
            Andhra Pradesh heatwave
          </div>
        </div>
      </div>
    </section>
  );
}
