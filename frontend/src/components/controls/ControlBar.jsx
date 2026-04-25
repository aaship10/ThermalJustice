import React, { useRef, useEffect, useState, useMemo } from 'react';
import gsap from 'gsap';

// Alphabetically sorted sub-areas
const pmcAreas = [
  "Ambegaon", "Aundh", "Baner", "Bawdhan", "Bhavani Peth", "Bibwewadi",
  "Deccan", "Dhankawadi", "Dhanori", "Dhayari", "Erandwane", "Hadapsar",
  "Kalyani Nagar", "Kasba Peth", "Katraj", "Kharadi", "Koregaon Park",
  "Kothrud", "Lohegaon", "Magarpatta", "Mundhwa", "Nana Peth", "Nanded City",
  "Narhe", "Pashan", "Phursungi", "Raviwar Peth", "Sadashiv Peth",
  "Sahakar Nagar", "Shaniwar Peth", "Shivajinagar", "Uruli Devachi",
  "Viman Nagar", "Vishrantwadi", "Wagholi", "Warje", "Yerawada"
];

const pcmcAreas = [
  "Akurdi", "Bhosari", "Charholi", "Chikhali", "Chinchwad", "Hinjawadi",
  "Kiwale", "Moshi", "Nigdi", "Pimple Gurav", "Pimple Nilakh",
  "Pimple Saudagar", "Pimpri", "Punawale", "Ravet", "Sangvi",
  "Tathawade", "Thergaon", "Wakad", "Yamunanagar"
];

// Unified list for the search filter
const allLocationOptions = [
  { id: 'all', label: 'All Pune Region', group: 'none' },
  { id: 'pmc-all', label: 'All PMC', group: 'PMC' },
  ...pmcAreas.map(a => ({ id: `pmc-${a.toLowerCase().replace(/ /g, '-')}`, label: a, group: 'PMC' })),
  { id: 'pcmc-all', label: 'All PCMC', group: 'PCMC' },
  ...pcmcAreas.map(a => ({ id: `pcmc-${a.toLowerCase().replace(/ /g, '-')}`, label: a, group: 'PCMC' }))
];

export default function ControlBar({
  location = 'all',
  budget,
  alpha,
  onLocationChange = () => { },
  onBudgetChange,
  onAlphaChange,
  onOptimise,
  portfolioStats,
  isOptimised,
}) {
  const barRef = useRef(null);
  const locationDropdownRef = useRef(null);

  // Local states
  const [localBudget, setLocalBudget] = useState(budget);
  const [showEquityInfo, setShowEquityInfo] = useState(false);

  // Location Search States
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // Helper to map an ID back to its readable label
  const getLocationLabel = (id) => {
    const found = allLocationOptions.find(opt => opt.id === id);
    return found ? found.label : 'Select Location';
  };

  // Sync external budget changes
  useEffect(() => {
    if (parseFloat(localBudget) !== budget && !(localBudget === '' && budget === 0)) {
      setLocalBudget(budget);
    }
  }, [budget]);

  // Sync external location changes to the search bar text
  useEffect(() => {
    setLocationSearchQuery(getLocationLabel(location));
  }, [location]);

  // Handle clicking outside the custom location dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setIsLocationOpen(false);
        setLocationSearchQuery(getLocationLabel(location));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [location]);

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
    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
      val = val.replace(/^0+/, '');
    }
    setLocalBudget(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      onBudgetChange(parsed);
    } else if (val === '') {
      onBudgetChange(0);
    }
  };

  const handleLocationSelect = (opt) => {
    setLocationSearchQuery(opt.label);
    onLocationChange(opt.id);
    setIsLocationOpen(false);
  };

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    if (locationSearchQuery === getLocationLabel(location)) {
      return allLocationOptions;
    }
    return allLocationOptions.filter(opt =>
      opt.label.toLowerCase().includes(locationSearchQuery.toLowerCase())
    );
  }, [locationSearchQuery, location]);

  const budgetUsedPct = portfolioStats && budget > 0
    ? Math.min(100, (portfolioStats.totalCost / budget) * 100)
    : 0;

  const equityDesc = alpha <= 0.2
    ? 'Max Efficiency'
    : alpha <= 0.4
      ? 'Balanced Distribution'
      : alpha <= 0.6
        ? 'Prioritizing Equity'
        : alpha <= 0.8
          ? 'Strong Equity'
          : 'Maximum Equity';

  const handleOptimiseClick = async () => {
    try {
      const payload = {
        location: location,
        budget: localBudget !== '' ? parseFloat(localBudget) : 0,
      };

      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://127.0.0.1:8000/api/history/save', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }
    } catch (err) {
      console.error("Failed to save query to DB:", err);
    }

    if (onOptimise) {
      onOptimise();
    }
  };

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

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Equity Slider Styles */
        .equity-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          background: transparent;
          outline: none;
          margin-bottom:10px;
          padding-top: 5px;
        }
        .equity-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .equity-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #0D9488;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(13, 148, 136, 0.4);
          margin-top: -6px; 
        }
        .equity-slider::-moz-range-track {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .equity-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #0D9488;
          cursor: pointer;
          border: none;
        }
      `}</style>

      <div
        ref={barRef}
        id="control-bar"
        className="fixed bottom-[20px] left-1/2 -translate-x-1/2 z-[100] px-6 py-4 w-[calc(100vw-80px)] max-w-[1200px]"
        style={{
          visibility: 'hidden',
          background: 'rgba(8, 16, 30, 0.75)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Main Flex Row - items-end aligns the bottom of the inputs/button together */}
        <div className="flex flex-row items-center gap-5 w-full">

          {/* 1. Location Search Combobox */}
          <div className="flex-[1.2] min-w-[220px] relative z-[120]" ref={locationDropdownRef}>
            <label className="block text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-1.5 pl-1">
              Target Region
            </label>
            <div className="relative flex items-center h-[48px]">
              <input
                type="text"
                value={locationSearchQuery}
                onChange={(e) => {
                  setLocationSearchQuery(e.target.value);
                  setIsLocationOpen(true);
                }}
                onFocus={(e) => {
                  e.target.select();
                  setIsLocationOpen(true);
                }}
                placeholder="Search area..."
                className="w-full h-full bg-black/20 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm font-semibold text-white focus:outline-none focus:border-[#0D9488] focus:bg-black/40 transition-all placeholder:text-white/30"
              />

              <div
                className="absolute right-3 text-[#94A3B8] cursor-pointer"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isLocationOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {/* Autocomplete Dropdown List - Pops UPWARDS */}
              {isLocationOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-full max-h-[300px] overflow-y-auto custom-scrollbar bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl z-[120] py-2">
                  {filteredLocations.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-[#94A3B8] italic">No areas found</div>
                  ) : (
                    filteredLocations.map((opt, index) => {
                      const showHeader = index === 0 || filteredLocations[index - 1].group !== opt.group;

                      return (
                        <React.Fragment key={opt.id}>
                          {showHeader && opt.group !== 'none' && (
                            <div className="px-4 py-1.5 mt-1 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider bg-white/5 sticky top-0 backdrop-blur-md z-10">
                              {opt.group === 'PMC' ? 'Pune Municipal Corporation' : 'Pimpri-Chinchwad'}
                            </div>
                          )}
                          <div
                            onClick={() => handleLocationSelect(opt)}
                            className={`px-4 py-2.5 text-sm text-white cursor-pointer transition-colors ${opt.id === location ? 'bg-[#0D9488]/20 text-[#2DD4BF] font-bold' : 'hover:bg-white/10'
                              }`}
                          >
                            {opt.label}
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2. Budget Number Input */}
          <div className="flex-1 min-w-[180px] relative z-10">
            <label className="block text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-1.5 pl-1">
              Budget
            </label>
            <div className="relative flex items-center h-[48px]">
              <span className="absolute left-4 text-lg font-bold text-teal-500 drop-shadow-[0_0_8px_rgba(13,148,136,0.4)] pointer-events-none">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={localBudget}
                onChange={handleBudgetInput}
                onFocus={(e) => e.target.select()}
                className="no-arrows w-full h-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-12 text-[24px] font-bold text-white drop-shadow-[0_0_12px_rgba(13,148,136,0.3)] focus:outline-none focus:border-[#0D9488] focus:bg-black/40 transition-all"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <span className="absolute right-4 text-[#94A3B8] font-bold text-sm pointer-events-none">
                Cr
              </span>
            </div>

            {/* Budget remaining gauge */}
            {isOptimised && (
              <div className="absolute -bottom-3 left-0 right-0 h-[3px] rounded-full overflow-hidden bg-white/5">
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

          {/* 3. Equity Slider */}
          <div className="flex-[1.5] min-w-[200px] relative z-10">
            <div className="flex items-center justify-between mb-1 pl-1">
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] text-[#94A3B8] tracking-wider font-semibold">
                  Equity Weight (α)
                </label>

                <div
                  className="relative flex items-center"
                  onMouseEnter={() => setShowEquityInfo(true)}
                  onMouseLeave={() => setShowEquityInfo(false)}
                >
                  <button
                    onClick={() => setShowEquityInfo(!showEquityInfo)}
                    className="flex items-center justify-center w-3.5 h-3.5 rounded-full border border-[#94A3B8] text-[#94A3B8] hover:text-white hover:border-white transition-colors text-[9px] font-bold cursor-pointer"
                  >
                    i
                  </button>

                  {showEquityInfo && (
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3 rounded-xl bg-[#0F172A] border border-white/10 shadow-2xl z-50 text-left">
                      <h4 className="text-white font-semibold text-xs mb-1.5">What is Equity Weight?</h4>
                      <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
                        Alpha (α) balances pure cooling efficiency with social distribution:
                      </p>
                      <ul className="text-slate-300 text-[11px] leading-relaxed space-y-1">
                        <li><strong className="text-white font-mono">0.0:</strong> Maximizes total cooling per Rupee spent.</li>
                        <li><strong className="text-white font-mono">1.0:</strong> Prioritizes the most vulnerable and poorest communities first.</li>
                      </ul>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white/10">
                        <div className="absolute -top-[7px] -left-[5px] border-[5px] border-transparent border-t-[#0F172A]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-[#94A3B8] italic truncate max-w-[130px] text-right">
                {equityDesc}
              </span>
            </div>

            <div className="relative h-[48px] flex flex-col justify-center bg-black/10 border border-transparent rounded-xl px-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={alpha}
                onChange={(e) => onAlphaChange(parseFloat(e.target.value))}
                className="equity-slider mb-1"
              />
              <div className="flex justify-between mt-1.5 text-[9px] text-[#94A3B8] font-medium tracking-wide">
                <span>MAX COOLING</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>α = {alpha.toFixed(1)}</span>
                <span>MAX EQUITY</span>
              </div>
            </div>
          </div>

          {/* 4. OPTIMISE Button */}
          <button
            onClick={handleOptimiseClick}
            className="shrink-0 group overflow-hidden relative z-10"
            style={{
              padding: '0 32px',
              height: '48px',
              background: 'linear-gradient(135deg, #0D9488 0%, #1A3C5E 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(13,148,136,0.4)',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="absolute top-0 w-1/2 h-full -left-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 ease-in-out group-hover:left-[150%]" />
            {isOptimised ? '♻️ RE-OPTIMISE' : '⚡ OPTIMISE'}
          </button>

        </div>
      </div>
    </>
  );
}