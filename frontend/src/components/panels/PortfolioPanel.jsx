import React, { useEffect, useState } from 'react';
import gsap from 'gsap';

const INTERVENTION_CONFIG = {
  tree_planting: { icon: '🌳', label: 'Urban Canopy', color: '#0D9488' },
  cool_roofs: { icon: '🏠', label: 'Cool Roofs', color: '#74ADD1' },
  cool_pavements: { icon: '🛣️', label: 'Cool Pavements', color: '#A0AAB2' },
  pocket_parks: { icon: '⛲', label: 'Pocket Parks', color: '#4ADE80' },
  // Live Backend mappings
  'Urban Forest': { icon: '🌳', label: 'Urban Forest', color: '#0D9488' },
  'Cool Roofs': { icon: '🏠', label: 'Cool Roofs', color: '#74ADD1' },
  'Permeable Rd': { icon: '🛣️', label: 'Permeable Roads', color: '#A0AAB2' },
  'Green Roofs': { icon: '🌿', label: 'Green Roofs', color: '#4ADE80' },
};

export default function PortfolioPanel({ portfolio, portfolioStats, budget, visible, onSaveScenario }) {
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    if (visible && portfolioStats?.peopleProtected) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: portfolioStats.peopleProtected,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => setAnimatedCount(Math.round(obj.val)),
      });
    }
  }, [visible, portfolioStats?.peopleProtected]);

  if (!visible || !portfolio) return null;

  // Aggregate interventions by type
  const counts = portfolio.interventions.reduce((acc, curr) => {
    const type = curr.intervention_type || curr.strategy || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const interventionsList = Object.entries(counts)
    .map(([type, count]) => ({
      type: INTERVENTION_CONFIG[type]?.label || type,
      icon: INTERVENTION_CONFIG[type]?.icon || '✨',
      color: INTERVENTION_CONFIG[type]?.color || '#FFFFFF',
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div
      className="liquid-glass-dark"
      style={{
        position: 'fixed',
        right: 0, top: '60px', bottom: '100px',
        width: '300px',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        overflowY: 'auto',
        padding: '20px',
        zIndex: 150,
        borderRadius: '0', // Full height side panel doesn't need outer border radius on right side, but the class has 20px. Override:
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <h3 className="text-sm uppercase tracking-widest text-[#94A3B8] font-bold mb-4 flex items-center gap-2">
        <span>📋</span> Portfolio Details
      </h3>

      {/* Hero Metric */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(13,148,136,0.15), rgba(26,60,94,0.2))',
        border: '1px solid rgba(13,148,136,0.25)',
        borderRadius: '16px',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
          People Protected
        </div>
        <div style={{ fontSize: '48px', fontWeight: 800, color: '#0D9488', fontFamily: 'var(--font-mono)', lineHeight: 1, marginBottom: '8px' }}>
          {animatedCount.toLocaleString()}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          estimated over 5 years
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider mb-1">Avg Cooling</div>
          <div className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>-{portfolioStats.avgDeltaT.toFixed(1)}°C</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider mb-1">Total Cost</div>
          <div className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>₹{portfolioStats.totalCost.toFixed(1)}Cr</div>
        </div>
      </div>

      {/* Interventions Breakdown */}
      <h4 className="text-xs uppercase tracking-wider text-[#94A3B8] mb-3">Planned Interventions</h4>
      <div className="space-y-1">
        {interventionsList.map(({ type, icon, count, color }) => (
          <div key={type} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>{type}</span>
            </div>
            <span style={{
              fontSize: '16px', fontWeight: 700, color,
              fontFamily: 'var(--font-mono)'
            }}>{count}</span>
          </div>
        ))}
        {interventionsList.length === 0 && (
          <div className="text-sm text-[#94A3B8] italic text-center p-4">
            No interventions fit in this budget/alpha combination.
          </div>
        )}
      </div>

      {/* Save Scenario Button */}
      {interventionsList.length > 0 && onSaveScenario && (
        <button
          onClick={onSaveScenario}
          className="w-full mt-6 py-3 rounded-xl border border-[#0D9488]/50 bg-[#0D9488]/10 text-[#0D9488] font-bold text-sm hover:bg-[#0D9488]/20 transition-colors"
        >
          💾 Save Scenario
        </button>
      )}

      {/* Efficiency Warning */}
      {portfolioStats.totalCost < budget * 0.9 && interventionsList.length > 0 && (
        <div className="mt-4 p-3 bg-[#FEE090]/10 border border-[#FEE090]/30 rounded-lg text-xs text-[#FEE090]">
          ⚠️ <strong>Note:</strong> Not all budget utilized. The remaining budget is too small for any single additional intervention in the target areas.
        </div>
      )}
    </div>
  );
}
