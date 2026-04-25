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
  
  // Local state to handle typing decimals smoothly (e.g., typing "10." without it jumping)
  const [localBudget, setLocalBudget] = useState(budget);

  // Sync external changes (if budget is updated from outside)
  useEffect(() => {
    // Only sync if the parsed values actually differ, to avoid wiping out trailing decimals like "5."
    if (parseFloat(localBudget) !== budget && !(localBudget === '' && budget === 0)) {
      setLocalBudget(budget);
    }
  }, [budget]);

  // Animate bar entrance
  useEffect(() => {
    if (barRef.current) {
      gsap.fromTo(barRef.current,
        { y: 120, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', delay: 0.5 }
      );
    }
  }, []);

  const handleBudgetInput = (e) => {
    let val = e.target.value;

    // Prevent leading zeros. If the user types '5' while the input is '0', 
    // it registers as '05'. This strips the '0' so it just becomes '5'.
    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
      val = val.replace(/^0+/, '');
    }

    setLocalBudget(val);
    
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      onBudgetChange(parsed);
    } else if (val === '') {
      onBudgetChange(0); // Fallback if user clears the input entirely
    }
  };

  const budgetUsedPct = portfolioStats && budget > 0
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
    : 'Maximum equity - prioritizing poorest communities';

  return (
    <>
      <style>{`
        /* Remove arrows from number input */
        .no-arrows::-webkit-inner-spin-button, 
        .no-arrows::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .no-arrows {
          -moz-appearance: textfield;
        }

        /* Equity Slider Styles */
        .equity-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          background: transparent;
          outline: none;
        }
        .equity-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .equity-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #0D9488;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(13, 148, 136, 0.4);
          margin-top: -6px; 
        }
        .equity-slider::-moz-range-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .equity-slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #0D9488;
          cursor: pointer;
          border: none;
        }
      `}</style>

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
        <div className="flex items-center gap-8 w-full p-0.5">
          
          {/* Budget Number Input */}
          <div className="flex-1">
            <label className="block text-xs text-[#94A3B8] uppercase tracking-wider font-medium mb-3">
              Budget
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-2xl font-bold text-teal-500 drop-shadow-[0_0_8px_rgba(13,148,136,0.4)] pointer-events-none">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={localBudget}
                onChange={handleBudgetInput}
                onFocus={(e) => e.target.select()} // Highlights the current number on click for easy replacement
                className="no-arrows w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-12 text-[32px] font-bold text-white drop-shadow-[0_0_12px_rgba(13,148,136,0.3)] focus:outline-none focus:border-[#0D9488] focus:bg-black/40 transition-all"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <span className="absolute right-4 text-[#94A3B8] font-bold text-lg pointer-events-none">
                Cr
              </span>
            </div>

            {/* Budget remaining gauge */}
            {isOptimised && (
              <div className="mt-3 h-1 rounded-full overflow-hidden bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${budgetUsedPct}%`,
                    backgroundColor: budgetUsedPct > 90 ? '#D73027' : '#0D9488',
                  }}
                />
              </div>
            )}
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
    </>
  );
}