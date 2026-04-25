import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function LandingCTA() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sectionRef.current) return;

    const words = titleRef.current.children;

    gsap.fromTo(
      words,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    gsap.fromTo(
      buttonRef.current,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    const pulseTween = gsap.to(buttonRef.current, {
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 60px rgba(13,148,136,0.5)',
      duration: 1.8,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1.5,
    });

    return () => {
      pulseTween.kill();
    };
  }, []);

  const handleClick = () => {
    navigate('/app');
  };

  return (
    <section
      ref={sectionRef}
      className="landing-glass-section relative z-20 flex min-h-screen items-center justify-center px-6 py-24 md:px-8 md:py-32"
      style={{
        backgroundColor: 'rgba(11, 25, 41, 0.34)',
        backgroundImage: 'linear-gradient(180deg, rgba(11,25,41,0.14) 0%, rgba(11,25,41,0.58) 100%)',
      }}
    >
      <div className="relative z-30 flex flex-col items-center gap-10 text-center md:gap-12">
        <h2
          ref={titleRef}
          className="flex flex-wrap justify-center gap-x-4 gap-y-2 overflow-hidden text-5xl font-extrabold text-white md:text-[72px]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="inline-block">Now,</span>
          <span className="inline-block">let&apos;s</span>
          <span className="inline-block">fix</span>
          <span className="inline-block">it.</span>
        </h2>

        <button
          ref={buttonRef}
          className="liquid-glass-button group relative z-30 inline-flex items-center gap-3 overflow-hidden"
          onClick={handleClick}
          style={{
            padding: '18px 48px',
            fontSize: '18px',
            fontWeight: 600,
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <span className="absolute top-0 h-full w-1/2 -left-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-500 ease-in-out group-hover:left-[150%]" />
          <span className="relative z-10">OPEN THE OPTIMIZER</span>
          <ArrowRight size={20} className="relative z-10" />
        </button>
      </div>
    </section>
  );
}
