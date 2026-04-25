import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    id: 'card-1',
    headline: "14°C difference.",
    subtext: "Two kilometers apart. Same city. One is getting planned relief. The other isn't.",
    start: '18%',
    end: '30%',
    position: { left: '8%', top: '50%', transform: 'translateY(-50%)' },
    fromX: -60,
    accent: 'linear-gradient(to bottom, #0D9488, #4575B4)',
  },
  {
    id: 'card-2',
    headline: "Proven interventions exist.",
    subtext: "Trees. Cool pavements. Green roofs. Pocket parks. Each reduces ambient temperature by 1–4°C.",
    start: '33%',
    end: '46%',
    position: { right: '8%', top: '50%', transform: 'translateY(-50%)' },
    fromX: 60,
    accent: 'linear-gradient(to bottom, #0D9488, #4575B4)',
  },
  {
    id: 'card-3',
    headline: "₹5 crore. 18,400 lives.",
    subtext: "Strategically deployed across Yerawada and Hadapsar's most vulnerable blocks.",
    start: '50%',
    end: '63%',
    position: { left: '50%', bottom: '20%', transform: 'translateX(-50%)' },
    fromX: 0,
    fromY: 60,
    accent: 'linear-gradient(to bottom, #0D9488, #4575B4)',
    centerAlign: true,
  },
  {
    id: 'card-4',
    headline: "This is not a visualization.",
    subtext: "This is an optimizer. It gives you a specific, defensible answer to where interventions save the most lives.",
    start: '67%',
    end: '78%',
    position: { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' },
    fromX: 0,
    fromY: 60,
    accent: '#D73027', // Heat red
    centerAlign: true,
  }
];

export default function ScrollCards() {
  const containerRef = useRef(null);

  useEffect(() => {
    const section = document.getElementById('frame-scrub-section');
    if (!section) return;

    CARDS.forEach((card) => {
      const el = document.getElementById(card.id);
      if (!el) return;

      gsap.fromTo(el,
        {
          opacity: 0,
          x: card.fromX || 0,
          y: card.fromY || 0,
          filter: 'blur(8px)',
          scale: 0.97
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          filter: 'blur(0px)',
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: `${card.start} top`,
            end: `${card.end} top`,
            toggleActions: 'play reverse play reverse',
            scrub: false,
            invalidateOnRefresh: true,
          }
        }
      );
    });

    return () => ScrollTrigger.getAll().forEach(t => {
      if (t.trigger === section) t.kill();
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed top-0 left-0 w-screen h-screen z-10 pointer-events-none">
      {CARDS.map((card) => (
        <div
          key={card.id}
          id={card.id}
          className="scroll-card liquid-glass pointer-events-auto"
          style={{
            ...card.position,
            position: 'absolute',
            padding: '28px 36px',
            maxWidth: '480px',
            textAlign: card.centerAlign ? 'center' : 'left',
          }}
        >
          {/* Colored accent bar on left edge (or hidden if center aligned maybe? Spec says left stripe) */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            bottom: '20%',
            width: '3px',
            borderRadius: '2px',
            background: card.accent,
          }} />

          <p style={{
            fontSize: '22px',
            fontWeight: 700,
            lineHeight: 1.3,
            color: 'white',
            fontFamily: 'var(--font-display)',
          }}>
            {card.headline}
          </p>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '8px',
            lineHeight: 1.5,
          }}>
            {card.subtext}
          </p>
        </div>
      ))}
    </div>
  );
}
