import React from 'react';
import StatusIcon from './StatusIcon.jsx';

const STAGES_CONFIG = [
  { id: 0, label: 'Loading city block data',      subtext: '627 blocks · Pune' },
  { id: 1, label: 'Loading intervention models',  subtext: 'ΔT predictions · 4 types' },
  { id: 2, label: 'Computing equity portfolios',  subtext: 'α × budget matrix' },
  { id: 3, label: 'Initializing map renderer',    subtext: 'MapLibre GL · dark theme' },
];

export default function StageList({ stageStatuses, stageTimes }) {
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-1">
      {STAGES_CONFIG.map((stageConfig, index) => {
        const status = stageStatuses[index];
        const timeMs = stageTimes[index];
        
        return (
          <div key={stageConfig.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            opacity: status === 'pending' ? 0.35 : 1,
            transition: 'opacity 0.3s ease',
          }}>
            <StatusIcon status={status} />
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'white' }}>
                {stageConfig.label}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                {stageConfig.subtext}
              </div>
            </div>
            
            {status === 'done' && timeMs !== null && (
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0D9488' }}>
                {timeMs}ms
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
