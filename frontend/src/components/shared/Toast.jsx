import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Toast({ message, visible, onDismiss }) {
  const toastRef = useRef(null);

  useEffect(() => {
    if (visible && toastRef.current) {
      gsap.fromTo(toastRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }
      );

      const timer = setTimeout(() => {
        gsap.to(toastRef.current, {
          opacity: 0, x: 50, duration: 0.3, ease: 'power2.in',
          onComplete: onDismiss
        });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      ref={toastRef}
      className="liquid-glass-dark"
      style={{
        position: 'fixed',
        top: '76px', right: '16px',
        width: '320px',
        padding: '16px 20px',
        background: 'rgba(8, 16, 30, 0.85)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {/* Colored left accent */}
      <div style={{
        position: 'absolute', left: 0, top: '20%', bottom: '20%',
        width: '3px', borderRadius: '2px',
        background: 'linear-gradient(to bottom, #FEE090, #F46D43)'
      }} />
      
      <p style={{ fontSize: '14px', color: 'white', fontWeight: 500, paddingLeft: '12px' }}>
        {message}
      </p>
      
      {/* Auto-dismiss progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
        borderRadius: '0 0 16px 16px',
        background: 'rgba(255,255,255,0.1)',
        overflow: 'hidden'
      }}>
        <div className="toast-progress-bar" style={{
          height: '100%',
          background: 'linear-gradient(to right, #0D9488, #4575B4)',
        }} />
      </div>
    </div>
  );
}
