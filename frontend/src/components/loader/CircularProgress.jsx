import React from 'react';

export default function CircularProgress({ progress }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;
  
  return (
    <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 24px' }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle cx="48" cy="48" r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        {/* Progress arc */}
        <circle cx="48" cy="48" r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#4575B4" />
          </linearGradient>
        </defs>
      </svg>
      {/* Centered percentage text */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color: 'white',
      }}>
        {Math.round(progress)}%
      </div>
    </div>
  );
}
