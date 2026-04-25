import React from 'react';

export default function Legend({ activeLayer }) {
  let title = '';
  let gradient = '';
  let labels = { low: '', high: '' };

  switch (activeLayer) {
    case 'tvs':
      title = 'Thermal Vulnerability';
      gradient = 'linear-gradient(to right, #313695, #4575B4, #74ADD1, #FEE090, #F46D43, #D73027)';
      labels = { low: 'Low Risk', high: 'High Risk' };
      break;
    case 'lst':
      title = 'Surface Temperature';
      gradient = 'linear-gradient(to right, #FEE090, #FDAE61, #F46D43, #D73027, #A50026)';
      labels = { low: '35°C', high: '50°C' };
      break;
    case 'ndvi':
      title = 'Vegetation Index';
      gradient = 'linear-gradient(to right, #FEE090, #D9EF8B, #A6D96A, #66BD63, #1A9850, #006837)';
      labels = { low: 'Barren', high: 'Dense Canopy' };
      break;
    default:
      return null;
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: '140px', left: '16px',
      padding: '14px 18px',
      background: 'rgba(8, 16, 30, 0.80)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      zIndex: 100,
      minWidth: '200px',
      overflow: 'hidden'
    }} className="liquid-glass-dark fixed">
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
        {title}
      </div>
      {/* Gradient bar */}
      <div style={{
        height: '8px', borderRadius: '4px',
        background: gradient,
        marginBottom: '6px'
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{labels.low}</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{labels.high}</span>
      </div>
    </div>
  );
}
