import React from 'react';
import { Layers, Map as MapIcon } from 'lucide-react';

export default function LayerToggle({ activeLayer, is3D, onLayerChange, onToggle3D }) {
  const layers = [
    { id: 'tvs', label: 'Vulnerability (TVS)' },
    { id: 'lst', label: 'Temperature (LST)' },
    { id: 'ndvi', label: 'Vegetation (NDVI)' }
  ];

  return (
    <div className="fixed top-[80px] left-[20px] z-10 flex flex-col gap-3">
      {/* 2D/3D Toggle Pill */}
      <button
        onClick={onToggle3D}
        className="liquid-glass flex items-center justify-center gap-2 self-start transition-all duration-300"
        style={{ padding: '8px 16px', borderRadius: '100px' }}
      >
        <MapIcon size={16} className={is3D ? 'text-[#0D9488]' : 'text-white'} />
        <span className="text-[13px] font-bold text-white uppercase tracking-wider">
          {is3D ? '3D View' : '2D View'}
        </span>
      </button>

      {/* Layer Segmented Control */}
      <div style={{
        display: 'inline-flex',
        padding: '4px',
        background: 'rgba(8, 16, 30, 0.75)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRadius: '100px',
        border: '1px solid rgba(255,255,255,0.08)',
        gap: '2px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {layers.map(layer => (
          <button
            key={layer.id}
            onClick={() => onLayerChange(layer.id)}
            style={{
              padding: '8px 20px',
              borderRadius: '100px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              background: activeLayer === layer.id
                ? 'rgba(255,255,255,0.15)'
                : 'transparent',
              backdropFilter: activeLayer === layer.id ? 'blur(10px)' : 'none',
              color: activeLayer === layer.id ? 'white' : 'rgba(255,255,255,0.45)',
              boxShadow: activeLayer === layer.id
                ? 'inset 0 1px 0 rgba(255,255,255,0.2)'
                : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            {layer.label}
          </button>
        ))}
      </div>
    </div>
  );
}
