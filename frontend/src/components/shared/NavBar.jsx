import React from 'react';
import { Link } from 'react-router-dom';
import { InfoIcon, DownloadIcon, LayersIcon } from 'lucide-react';

export default function NavBar({
  activeTab,
  onTabChange,
  onInfoClick,
  onExportClick,
  onModelCardsClick,
}) {
  return (
    <nav className="liquid-glass-nav" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 9999,
    }}>
      {/* LEFT: Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Flame/heat icon in teal */}
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, #0D9488, #4575B4)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px'
        }}>
          🌡️
        </div>
        <Link
          to="/"
          aria-label="Go to the ThermalJustice landing page"
          style={{ fontSize: '16px', fontWeight: 700, color: 'white', textDecoration: 'none' }}
        >
          ThermalJustice
        </Link>
        <span style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          paddingLeft: '8px', borderLeft: '1px solid rgba(255,255,255,0.15)'
        }}>Pune</span>
      </div>

      {/* CENTER: Pill tab bar — only show on app, hide on landing */}
      {activeTab && (
        <div style={{
          display: 'flex', gap: '4px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '100px',
          padding: '4px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          {['Heat Map', 'Analytics', 'About'].map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                padding: '6px 20px',
                borderRadius: '100px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                background: activeTab === tab ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.5)',
                backdropFilter: activeTab === tab ? 'blur(10px)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* RIGHT: Icon buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onInfoClick} style={iconButtonStyle} title="Information">
          <InfoIcon size={16} />
        </button>
        <button onClick={onExportClick} style={iconButtonStyle} title="Export Report">
          <DownloadIcon size={16} />
        </button>
        <button onClick={onModelCardsClick} style={iconButtonStyle} title="Model Cards">
          <LayersIcon size={16} />
        </button>
      </div>
    </nav>
  );
}

const iconButtonStyle = {
  width: 36, height: 36,
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: 'rgba(255,255,255,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};
