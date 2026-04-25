import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TempHistogram({ geojson }) {
  const chartData = useMemo(() => {
    if (!geojson || !geojson.features) return [];

    // Define bins
    const bins = [
      { min: 0, max: 31, label: '< 31°C', Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      { min: 31, max: 34, label: '31-34°C', Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      { min: 34, max: 37, label: '34-37°C', Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      { min: 37, max: 40, label: '37-40°C', Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      { min: 40, max: 43, label: '40-43°C', Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      { min: 43, max: 46, label: '43-46°C', Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      { min: 46, max: 100, label: '> 46°C', Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
    ];

    geojson.features.forEach((feature) => {
      const { lst_mean, pop_density, poverty_proxy } = feature.properties;
      
      // Calculate estimated population per block (assuming 200x200m = 0.04 sq km)
      const pop = (pop_density * 0.04) || 0;

      // Determine quartile (poverty_proxy 1 = poorest)
      let q = 'Q4'; // Richest
      if (poverty_proxy >= 0.75) q = 'Q1';
      else if (poverty_proxy >= 0.5) q = 'Q2';
      else if (poverty_proxy >= 0.25) q = 'Q3';

      // Find bin
      const bin = bins.find(b => lst_mean >= b.min && lst_mean < b.max);
      if (bin) {
        bin[q] += pop;
      }
    });

    // Round populations for cleaner display
    return bins.map(b => ({
      name: b.label,
      Q1: Math.round(b.Q1),
      Q2: Math.round(b.Q2),
      Q3: Math.round(b.Q3),
      Q4: Math.round(b.Q4),
    }));
  }, [geojson]);

  if (!chartData.length) return null;

  return (
    <div className="glass-card p-6 mt-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Who Lives in the Heat
        </h3>
        <p className="text-sm text-[#94A3B8]">
          Population distribution by land surface temperature and income quartile. 
          Notice the "heat poverty overlap" on the right — the poorest populations are heavily concentrated in the hottest blocks.
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
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ fontSize: '14px', fontWeight: 500 }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            
            {/* Q1 = Poorest (Red), Q4 = Richest (Blue) */}
            <Bar dataKey="Q1" name="Q1 (Poorest)" stackId="a" fill="#D73027" />
            <Bar dataKey="Q2" name="Q2" stackId="a" fill="#FDAE61" />
            <Bar dataKey="Q3" name="Q3" stackId="a" fill="#74ADD1" />
            <Bar dataKey="Q4" name="Q4 (Richest)" stackId="a" fill="#313695" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
