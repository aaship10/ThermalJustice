import React from 'react';

/**
 * Helper to determine color based on TVS score
 */
function getTvsColor(score) {
  if (score >= 0.8) return '#D73027'; // high risk
  if (score >= 0.6) return '#F46D43';
  if (score >= 0.4) return '#FEE090'; // medium
  if (score >= 0.2) return '#74ADD1';
  return '#4575B4'; // low risk
}

export default function BlockDetail({ block, interventionEffects, onClose, portfolioOpen }) {
  if (!block) return null;

  const {
    block_id,
    neighborhood,
    population,
    tvs,
    base_lst,
    tree_canopy_pct,
    shap_tree_canopy,
    shap_roof_albedo,
  } = block;

  const tvsColor = getTvsColor(tvs);

  // Check if there's an intervention planned
  const plannedIntervention = interventionEffects?.find(e => e.block_id === block_id);

  return (
    <div
      className="liquid-glass-dark"
      style={{
        position: 'fixed',
        right: portfolioOpen ? '320px' : '20px', // sits left of portfolio panel or flush right
        top: '80px', // below nav
        bottom: '120px', // above control bar
        width: '340px',
        padding: '24px',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        borderRadius: portfolioOpen ? '20px 0 0 20px' : '20px', // flush with portfolio panel
        zIndex: 200,
        overflowY: 'auto',
        transition: 'all 0.3s ease',
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-[#94A3B8] hover:text-white transition-colors"
      >
        ✕
      </button>

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-1">{neighborhood}</h3>
        <p className="text-sm text-[#94A3B8] mb-4">Block ID: {block_id}</p>
        
        {/* TVS badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '100px',
          background: `linear-gradient(135deg, ${tvsColor}33, ${tvsColor}66)`,
          border: `1px solid ${tvsColor}88`,
          fontSize: '13px',
          fontWeight: 700,
          color: tvsColor,
          backdropFilter: 'blur(10px)',
        }}>
          TVS: {tvs.toFixed(2)}
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <StatCard label="Population" value={population.toLocaleString()} color="#74ADD1" />
        <StatCard label="Base LST" value={`${base_lst.toFixed(1)}°C`} color={getTvsColor((base_lst - 35) / 15)} />
        <StatCard label="Canopy" value={`${Math.round(tree_canopy_pct * 100)}%`} color="#0D9488" />
        <StatCard label="Poverty Rate" value={`${Math.round(block.poverty_rate * 100)}%`} color="#FEE090" />
      </div>

      {/* SHAP Values (Explainable AI) */}
      <div className="mb-6">
        <h4 className="text-xs uppercase tracking-wider text-[#94A3B8] mb-3">Vulnerability Drivers</h4>
        <div className="space-y-3">
          <ShapBar label="Lack of Canopy" value={shap_tree_canopy} color="#F46D43" />
          <ShapBar label="Low Roof Albedo" value={shap_roof_albedo} color="#D73027" />
          <ShapBar label="High Population Density" value={block.shap_population} color="#FEE090" />
        </div>
      </div>

      {/* Intervention Impact (If optimized) */}
      {plannedIntervention && (
        <div className="mt-6 p-4 rounded-xl border border-[#0D9488]/30" style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.1), transparent)' }}>
          <h4 className="text-sm font-bold text-[#0D9488] mb-2 flex items-center gap-2">
            <span>✨</span> Intervention Planned
          </h4>
          <p className="text-white text-sm mb-3">
            <strong className="capitalize">{plannedIntervention.intervention_type.replace('_', ' ')}</strong> allocated for this block.
          </p>
          <div className="flex justify-between items-center text-sm border-t border-[#0D9488]/20 pt-2">
            <span className="text-[#94A3B8]">Est. Cooling</span>
            <span className="font-bold text-white font-mono">-{plannedIntervention.delta_t.toFixed(1)}°C</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-[#94A3B8]">Cost</span>
            <span className="font-bold text-white font-mono">₹{plannedIntervention.cost_cr.toFixed(2)} Cr</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
    </div>
  );
}

function ShapBar({ label, value = 0.5, color }) {
  // Normalize SHAP roughly to 0-100% for display
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-white/70">{label}</span>
        <span className="text-white/50">+{Math.round(pct)}% risk</span>
      </div>
      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
