import React from 'react';

const DATA_SOURCES = [
  {
    name: 'Landsat 8/9 Surface Temperature',
    source: 'USGS Earth Explorer / Google Earth Engine',
    period: '2019–2024 (summer months)',
    contribution: 'Land Surface Temperature (LST) at 30m resolution — primary thermal input',
  },
  {
    name: 'Sentinel-2 Vegetation Index',
    source: 'ESA Copernicus Open Access Hub',
    period: '2020–2024',
    contribution: 'NDVI and canopy fraction — vegetation cover metrics',
  },
  {
    name: 'OpenStreetMap Building Data',
    source: 'OpenStreetMap via Overpass API',
    period: 'Current (2024)',
    contribution: 'Building footprints, density, and canyon aspect ratio',
  },
  {
    name: 'Census of India (Ward-level)',
    source: 'Census of India 2011 + Smart Cities Mission updates',
    period: '2011, updated 2020',
    contribution: 'Population density, elderly population fraction, deprivation index proxy',
  },
  {
    name: 'Pune Municipal Corporation GIS',
    source: 'PMC Open Data Portal',
    period: '2022–2024',
    contribution: 'Ward boundaries, road network, park locations, land use classification',
  },
  {
    name: 'India Meteorological Department',
    source: 'IMD Pune Observatory',
    period: '2015–2024',
    contribution: 'Ambient temperature, humidity, heatwave records, mortality data validation',
  },
  {
    name: 'Research Literature (Meta-analysis)',
    source: '47 peer-reviewed papers (Akbari et al., 2001; Santamouris et al., 2017; etc.)',
    period: '2001–2024',
    contribution: 'Intervention effectiveness ranges (ΔT per intervention type), cost benchmarks',
  },
];

const MODEL_CARDS = [
  {
    name: 'TVS Predictor (GNN)',
    metric: 'R² = 0.87',
    training: '4,200 blocks across 12 Indian cities',
    uncertainty: '±0.08 TVS (95% CI)',
    description: 'Graph Neural Network predicting Thermal Vulnerability Score from spatial, demographic, and land-cover features.',
  },
  {
    name: 'Intervention Effect Estimator',
    metric: 'R² = 0.79',
    training: '312 intervention case studies',
    uncertainty: '±0.6°C (95% CI)',
    description: 'Random Forest regressor estimating ΔT per intervention type per block, accounting for local morphology.',
  },
  {
    name: 'Equity-Weighted Optimizer',
    metric: 'Knapsack with α-weighting',
    training: 'N/A (optimization algorithm)',
    uncertainty: 'Pareto-optimal by construction',
    description: 'Modified multi-objective knapsack solver balancing cooling efficiency (1−α) and equity distribution (α).',
  },
];

/**
 * DataSourcesModal — Modal listing all data sources and model cards.
 */
export default function DataSourcesModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative glass-card p-8 max-w-3xl max-h-[80vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Data Sources & Model Cards
        </h2>

        {/* Data Sources */}
        <h3 className="text-sm text-[#94A3B8] uppercase tracking-wider mb-4 font-medium">Data Sources</h3>
        <div className="space-y-3 mb-8">
          {DATA_SOURCES.map((ds, i) => (
            <div key={i} className="glass-card p-4" style={{ borderRadius: '8px' }}>
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-sm font-semibold text-white">{ds.name}</h4>
                <span className="text-[10px] text-[#94A3B8] bg-white/5 px-2 py-0.5 rounded-full shrink-0 ml-2">
                  {ds.period}
                </span>
              </div>
              <div className="text-xs text-[#0D9488] mb-1">{ds.source}</div>
              <div className="text-xs text-[#94A3B8]">{ds.contribution}</div>
            </div>
          ))}
        </div>

        {/* Model Cards */}
        <h3 className="text-sm text-[#94A3B8] uppercase tracking-wider mb-4 font-medium">Model Cards</h3>
        <div className="space-y-3">
          {MODEL_CARDS.map((mc, i) => (
            <div key={i} className="glass-card p-4" style={{ borderRadius: '8px', borderLeft: '3px solid #0D9488' }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">{mc.name}</h4>
                <span
                  className="text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 px-2 py-0.5 rounded-full"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {mc.metric}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mb-2">{mc.description}</p>
              <div className="flex gap-4 text-[10px] text-[#94A3B8]">
                <span>Training: {mc.training}</span>
                <span>Uncertainty: {mc.uncertainty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
