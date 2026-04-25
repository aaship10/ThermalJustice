import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ErrorBar } from 'recharts';

export default function CostEffChart({ interventionEffects }) {
  const chartData = useMemo(() => {
    if (!interventionEffects || Object.keys(interventionEffects).length === 0) return [];
    
    const types = ['tree_planting', 'cool_pavement', 'green_roof', 'pocket_park'];
    const labels = {
      'tree_planting': 'Trees',
      'cool_pavement': 'Cool Pavement',
      'green_roof': 'Green Roof',
      'pocket_park': 'Pocket Park'
    };
    const colors = {
      'tree_planting': '#10B981', // Emerald
      'cool_pavement': '#94A3B8', // Slate
      'green_roof': '#84CC16',    // Lime
      'pocket_park': '#059669'    // Dark green
    };

    const aggregated = types.reduce((acc, type) => {
      acc[type] = { totalDt: 0, totalLow: 0, totalHigh: 0, totalCost: 0, count: 0 };
      return acc;
    }, {});

    Object.values(interventionEffects).forEach(blockEffects => {
      types.forEach(type => {
        if (blockEffects[type]) {
          aggregated[type].totalDt += Math.abs(blockEffects[type].delta_t);
          aggregated[type].totalLow += Math.abs(blockEffects[type].delta_t_low);
          aggregated[type].totalHigh += Math.abs(blockEffects[type].delta_t_high);
          aggregated[type].totalCost += blockEffects[type].cost_lakh;
          aggregated[type].count += 1;
        }
      });
    });

    return types.map(type => {
      const data = aggregated[type];
      if (data.count === 0) return null;

      const avgDt = data.totalDt / data.count;
      const avgLow = data.totalLow / data.count;
      const avgHigh = data.totalHigh / data.count;
      const avgCost = data.totalCost / data.count;

      // Calculate efficiency: Delta T per 1 Lakh
      const eff = avgDt / avgCost;
      
      // Calculate error bounds based on the low/high averages relative to the mean
      // Note: Math.abs(delta_t_low) is actually higher magnitude cooling
      const effLow = avgHigh / avgCost; 
      const effHigh = avgLow / avgCost;

      // ErrorBar format requires [bottomError, topError] relative to the value
      const errorArray = [Math.abs(eff - effLow), Math.abs(effHigh - eff)];

      return {
        name: labels[type],
        typeId: type,
        efficiency: Number(eff.toFixed(4)),
        errorBars: errorArray,
        color: colors[type],
        tooltipDt: avgDt.toFixed(2),
        tooltipCost: Math.round(avgCost)
      };
    }).filter(Boolean).sort((a, b) => b.efficiency - a.efficiency);
  }, [interventionEffects]);

  if (!chartData.length) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-4" style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-white font-bold mb-2">{data.name}</p>
          <p className="text-sm text-[#94A3B8]">Avg Cooling: <span className="text-[#0D9488]">-{data.tooltipDt}°C</span></p>
          <p className="text-sm text-[#94A3B8]">Avg Cost: <span className="text-white">₹{data.tooltipCost} Lakh</span></p>
          <p className="text-sm text-[#94A3B8] mt-2 border-t border-white/10 pt-2">
            Efficiency: <span className="font-mono text-white">{data.efficiency} °C/Lakh</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 mt-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Intervention Cost-Effectiveness
        </h3>
        <p className="text-sm text-[#94A3B8]">
          Average cooling effect (°C) achieved per ₹1 Lakh spent. 
          This explains the AI's strong preference for certain interventions when optimizing purely for temperature reduction.
        </p>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}} />
            <YAxis 
              stroke="rgba(255,255,255,0.5)" 
              tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}}
              label={{ value: '°C per ₹1 Lakh', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
            
            <Bar dataKey="efficiency" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <ErrorBar dataKey="errorBars" width={4} strokeWidth={2} stroke="rgba(255,255,255,0.6)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
