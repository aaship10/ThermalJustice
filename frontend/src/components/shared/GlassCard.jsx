import React from 'react';

/**
 * GlassCard — Reusable glassmorphism card wrapper with optional hover effects.
 */
export default function GlassCard({ children, className = '', hover = false, onClick, style }) {
  return (
    <div
      className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
