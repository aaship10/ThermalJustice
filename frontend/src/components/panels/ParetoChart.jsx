import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell,
  Label,
} from 'recharts';

/**
 * ParetoChart — Scatter chart showing the Pareto front (equity vs. cooling trade-off).
 */
export default function ParetoChart({ paretoData, currentAlpha, onAlphaSelect }) {
  if (!paretoData || paretoData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-[#94A3B8]">
        No Pareto data available. Run the optimizer first.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const d = payload[0].payload;
      return (
        <div className="glass-card px-4 py-3 text-sm">
          <div className="text-white font-semibold">α = {d.alpha.toFixed(1)}</div>
          <div className="text-[#94A3B8]">Equity: {d.equity.toFixed(2)}</div>
          <div className="text-[#94A3B8]">Cooling: {d.cooling.toFixed(1)}°C</div>
          <div className="text-[#94A3B8]">Protected: {d.people_protected?.toLocaleString()}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3
        className="text-xl font-bold text-white mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Pareto Front — Equity vs. Cooling Trade-off
      </h3>
      <p className="text-sm text-[#94A3B8] mb-6">
        Each point represents an optimal portfolio at a different equity weighting (α).
        Click a point to load that portfolio.
      </p>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

          {/* Recommended zone */}
          <ReferenceArea
            x1={0.4}
            x2={0.7}
            y1={0}
            fill="rgba(13,148,136,0.08)"
            stroke="rgba(13,148,136,0.2)"
            strokeDasharray="4 4"
            label={{
              value: 'Recommended Zone',
              position: 'insideTopRight',
              fill: '#0D9488',
              fontSize: 11,
            }}
          />

          <XAxis
            type="number"
            dataKey="equity"
            domain={[0, 1]}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          >
            <Label
              value="Equity of Distribution →"
              position="bottom"
              offset={20}
              style={{ fill: '#94A3B8', fontSize: 12 }}
            />
          </XAxis>

          <YAxis
            type="number"
            dataKey="cooling"
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          >
            <Label
              value="↑ Total Cooling (°C)"
              angle={-90}
              position="insideLeft"
              offset={-5}
              style={{ fill: '#94A3B8', fontSize: 12, textAnchor: 'middle' }}
            />
          </YAxis>

          <Tooltip content={<CustomTooltip />} />

          {/* Current α indicator */}
          <ReferenceLine
            x={currentAlpha * 0.6 + 0.2}
            stroke="#0D9488"
            strokeDasharray="4 4"
            strokeWidth={1}
          />

          <Scatter
            data={paretoData}
            onClick={(data) => onAlphaSelect && onAlphaSelect(data.alpha)}
            cursor="pointer"
          >
            {paretoData.map((entry, i) => {
              const isSelected = Math.abs(entry.alpha - currentAlpha) < 0.05;
              return (
                <Cell
                  key={i}
                  fill={isSelected ? '#0D9488' : '#4575B4'}
                  r={isSelected ? 10 : 6}
                  stroke={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.3)'}
                  strokeWidth={isSelected ? 2 : 1}
                />
              );
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Narration */}
      <div className="mt-6 glass-card p-4">
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          The Pareto front reveals the fundamental trade-off in urban heat intervention:
          maximizing total cooling efficiency (left) versus ensuring equitable distribution
          across income quartiles (right). The <span className="text-[#0D9488] font-medium">recommended zone
          (α = 0.4–0.6)</span> balances both objectives, protecting the most vulnerable
          while maintaining cost-effectiveness.
        </p>
      </div>
    </div>
  );
}
