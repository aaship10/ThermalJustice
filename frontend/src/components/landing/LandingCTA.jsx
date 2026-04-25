import React, { useRef, useEffect } from 'react';
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

  useEffect(() => {
    if (!sectionRef.current) return;

    // Entrance animation for title words
    const words = titleRef.current.children;
    gsap.fromTo(words,
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
        }
      }
    );

    // Entrance animation for button
    gsap.fromTo(buttonRef.current,
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
        }
      }
    );

    // Idle pulse animation for button
    gsap.to('.cta-button', {
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 60px rgba(13,148,136,0.5)',
      duration: 1.8,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1.5,
    });

  }, []);

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app');
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center min-h-screen px-8 bg-[#0B1929]"
    >
      <h2
        ref={titleRef}
        className="text-5xl md:text-[72px] font-extrabold text-white mb-12 flex gap-4 overflow-hidden"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <span className="inline-block">Now,</span>
        <span className="inline-block">let's</span>
        <span className="inline-block">fix</span>
        <span className="inline-block">it.</span>
      </h2>

      <button
        ref={buttonRef}
        className="cta-button liquid-glass-button group"
        onClick={handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '18px 48px',
          fontSize: '18px',
          fontWeight: 600,
          color: 'white',
          cursor: 'pointer',
        }}
      >
        {/* Shimmer sweep animation on hover */}
        <span className="absolute top-0 w-1/2 h-full -left-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-500 ease-in-out group-hover:left-[150%]" />
        
        OPEN THE OPTIMIZER
        <ArrowRight size={20} />
      </button>
    </section>
  );
}
