import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

export default function ControlBar({
  budget,
  alpha,
  onBudgetChange,
  onAlphaChange,
  onOptimise,
  portfolioStats,
  isOptimised,
}) {
  const barRef = useRef(null);
  const budgetDisplayRef = useRef(null);
  const [budgetDisplay, setBudgetDisplay] = useState(budget);

  // Animate bar entrance
  useEffect(() => {
    if (barRef.current) {
      gsap.fromTo(barRef.current,
        { y: 120, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', delay: 0.5 }
      );
    }
  }, []);

  // Animate budget number on change
  useEffect(() => {
    const obj = { val: budgetDisplay };
    gsap.to(obj, {
      val: budget,
      duration: 0.3,
      ease: 'power2.out',
      onUpdate: () => setBudgetDisplay(obj.val),
    });
  }, [budget]);

  const budgetUsedPct = portfolioStats
    ? Math.min(100, (portfolioStats.totalCost / budget) * 100)
    : 0;

  const equityDesc = alpha <= 0.2
    ? 'Maximizing total cooling efficiency'
    : alpha <= 0.4
    ? 'Balancing efficiency with equitable distribution'
    : alpha <= 0.6
    ? 'Prioritizing equitable distribution'
    : alpha <= 0.8
    ? 'Strong equity weighting'
    : 'Maximum equity — prioritizing poorest communities';

  return (
    <div
      ref={barRef}
      id="control-bar"
      className="fixed bottom-[20px] left-1/2 -translate-x-1/2 z-[100] px-7 py-5 w-[calc(100vw-680px)] max-w-[900px]"
      style={{
        visibility: 'hidden',
        background: 'rgba(8, 16, 30, 0.75)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-8 w-full">
        {/* Budget Slider */}
        <div className="flex-1">
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-xs text-[#94A3B8] uppercase tracking-wider font-medium">Budget</label>
            <span
              ref={budgetDisplayRef}
              className="text-[32px] font-bold text-white drop-shadow-[0_0_12px_rgba(13,148,136,0.3)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              ₹{budgetDisplay.toFixed(1)} Cr
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="20"
            step="0.5"
            value={budget}
            onChange={(e) => onBudgetChange(parseFloat(e.target.value))}
            className="budget-slider"
            style={{
              '--value-pct': `${((budget - 0.5) / 19.5) * 100}%`,
            }}
          />
          {/* Budget remaining gauge */}
          {isOptimised && (
            <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${budgetUsedPct}%`,
                  backgroundColor: budgetUsedPct > 90 ? '#D73027' : '#0D9488',
                }}
              />
            </div>
          )}
          <div className="flex justify-between mt-1 text-[10px] text-[#94A3B8]">
            <span>₹0.5 Cr</span>
            <span>₹20 Cr</span>
          </div>
        </div>

        {/* Equity Slider */}
        <div className="flex-1">
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-xs text-[#94A3B8] uppercase tracking-wider font-medium">Equity Weight (α)</label>
            <span className="text-xs text-[#94A3B8] italic">{equityDesc}</span>
          </div>
          <div className="relative pt-3 pb-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={alpha}
              onChange={(e) => onAlphaChange(parseFloat(e.target.value))}
              className="equity-slider"
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-[#94A3B8]">
            <span>Max Cooling</span>
            <span className="font-medium" style={{ fontFamily: 'var(--font-mono)' }}>α = {alpha.toFixed(1)}</span>
            <span>Max Equity</span>
          </div>
        </div>

        {/* OPTIMISE Button */}
        <button
          onClick={onOptimise}
          className="shrink-0 group overflow-hidden relative"
          style={{
            padding: '12px 32px',
            background: 'linear-gradient(135deg, #0D9488 0%, #1A3C5E 100%)',
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(13,148,136,0.4)',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <span className="absolute top-0 w-1/2 h-full -left-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 ease-in-out group-hover:left-[150%]" />
          {isOptimised ? '♻️ RE-OPTIMISE' : '⚡ OPTIMISE PORTFOLIO'}
        </button>
      </div>
    </div>
  );
}
