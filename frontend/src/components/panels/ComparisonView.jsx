import React, { useState, useRef, useCallback } from 'react';

/**
 * ComparisonView — Before/after split view with draggable vertical divider.
 * Uses clip-path on a single map representation for simplicity.
 */
export default function ComparisonView({ onClose }) {
  const [dividerPos, setDividerPos] = useState(50); // percentage
  const containerRef = useRef(null);
  const draggingRef = useRef(false);

  const handleMouseDown = useCallback(() => {
    draggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setDividerPos(Math.max(5, Math.min(95, x)));
  }, []);

  const handleMouseUp = useCallback(() => {
    draggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  return (
    <div
      className="fixed inset-0 z-[300] bg-[#0B1929]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[310] w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10 transition-all"
      >
        ✕
      </button>

      <div ref={containerRef} className="w-full h-full relative overflow-hidden">
        {/* Left side — "Today" (Hot) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 ${100 - dividerPos}% 0 0)`,
            background: 'linear-gradient(135deg, #D73027 0%, #F46D43 30%, #FEE090 60%, #D73027 100%)',
          }}
        >
          {/* Heat pattern overlay */}
          <div className="absolute inset-0" style={{
            background: 'repeating-conic-gradient(rgba(215,48,39,0.1) 0deg 10deg, transparent 10deg 20deg)',
            mixBlendMode: 'overlay',
          }} />
          <div className="absolute top-6 left-6 glass-card px-4 py-2">
            <span className="text-sm font-semibold text-white">Current State</span>
          </div>
          <div className="absolute bottom-24 left-8 max-w-xs">
            <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-mono)' }}>46.2°C</div>
            <div className="text-sm text-white/70">Mean surface temperature</div>
          </div>
        </div>

        {/* Right side — "After" (Cool) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 0 0 ${dividerPos}%)`,
            background: 'linear-gradient(135deg, #4575B4 0%, #74ADD1 30%, #0D9488 60%, #22C55E 100%)',
          }}
        >
          <div className="absolute inset-0" style={{
            background: 'repeating-conic-gradient(rgba(13,148,136,0.1) 0deg 10deg, transparent 10deg 20deg)',
            mixBlendMode: 'overlay',
          }} />
          <div className="absolute top-6 right-6 glass-card px-4 py-2">
            <span className="text-sm font-semibold text-white">Post-Intervention Projection</span>
          </div>
          <div className="absolute bottom-24 right-8 max-w-xs text-right">
            <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-mono)' }}>44.4°C</div>
            <div className="text-sm text-white/70">Projected surface temperature</div>
            <div className="text-sm text-[#0D9488] font-semibold mt-1">−1.8°C average reduction</div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="absolute top-0 bottom-0 z-[305] cursor-col-resize"
          style={{ left: `${dividerPos}%`, transform: 'translateX(-50%)', width: '40px' }}
          onMouseDown={handleMouseDown}
        >
          {/* Line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white shadow-lg" />
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-card flex items-center justify-center border border-white/30">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M4 3l-3 5 3 5M12 3l3 5-3 5" stroke="white" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-card px-6 py-3 z-[310]">
        <p className="text-sm text-[#94A3B8] text-center">
          Drag the divider to compare current state vs. post-intervention projection
        </p>
      </div>
    </div>
  );
}
