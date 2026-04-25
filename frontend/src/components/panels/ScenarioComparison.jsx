import React from 'react';

export default function ScenarioComparison({ scenarios, onClose, onRestore }) {
  if (!scenarios || scenarios.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-8 bg-[#0B1929]/95 backdrop-blur-md">
      <div className="absolute top-8 right-8">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      <div className="w-full max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Scenario Comparison
          </h2>
          <p className="text-[#94A3B8]">
            Compare up to two saved portfolios to understand the trade-offs in different planning strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {scenarios.map((scenario, index) => {
            const { id, alpha, budget, stats, date, portfolio } = scenario;
            const isEquityFocused = alpha > 0.5;
            
            return (
              <div key={id} className="glass-card p-8 relative flex flex-col h-full" style={{ borderTop: `4px solid ${isEquityFocused ? '#10B981' : '#3B82F6'}` }}>
                <div className="absolute top-4 right-4 text-xs text-[#94A3B8]">
                  Saved {new Date(date).toLocaleTimeString()}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isEquityFocused ? 'Equity-Focused Plan' : 'Efficiency-Focused Plan'}
                </h3>
                <div className="flex gap-4 mb-8">
                  <div className="bg-white/5 rounded px-3 py-1">
                    <span className="text-xs text-[#94A3B8] uppercase block">Budget</span>
                    <span className="text-lg font-bold text-white">₹{budget.toFixed(1)} Cr</span>
                  </div>
                  <div className="bg-white/5 rounded px-3 py-1">
                    <span className="text-xs text-[#94A3B8] uppercase block">Equity Wt (α)</span>
                    <span className="text-lg font-bold text-white">{alpha.toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-6 flex-grow">
                  <div>
                    <div className="text-sm text-[#94A3B8] mb-1">Estimated Lives Protected</div>
                    <div className="text-3xl font-bold text-[#0D9488]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {stats?.peopleProtected?.toLocaleString() || 0}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-[#94A3B8] mb-1">Average Cooling Achieved</div>
                    <div className="text-2xl font-bold text-white">
                      -{stats?.avgDeltaT?.toFixed(2) || 0}°C
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-[#94A3B8] mb-1">Total Interventions</div>
                    <div className="text-lg text-white">
                      {portfolio?.interventions?.length || 0} locations treated
                    </div>
                  </div>
                  
                  {/* Mini Equity Distribution Bar */}
                  {stats?.equityDistribution && (
                    <div className="pt-4 border-t border-white/10">
                      <div className="text-sm text-[#94A3B8] mb-2">Budget Distribution by Income Quartile</div>
                      <div className="w-full h-4 rounded-full flex overflow-hidden">
                        <div style={{ width: `${stats.equityDistribution.Q1}%`, backgroundColor: '#D73027' }} title="Q1 (Poorest)" />
                        <div style={{ width: `${stats.equityDistribution.Q2}%`, backgroundColor: '#FDAE61' }} title="Q2" />
                        <div style={{ width: `${stats.equityDistribution.Q3}%`, backgroundColor: '#74ADD1' }} title="Q3" />
                        <div style={{ width: `${stats.equityDistribution.Q4}%`, backgroundColor: '#313695' }} title="Q4 (Richest)" />
                      </div>
                      <div className="flex justify-between text-[10px] mt-1 text-[#94A3B8]">
                        <span>Q1 (Poorest)</span>
                        <span>Q4 (Richest)</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={() => onRestore(scenario)}
                    className="w-full py-3 rounded-lg font-semibold text-white bg-[#0D9488] hover:bg-[#0F766E] transition-colors"
                  >
                    Restore This Scenario
                  </button>
                </div>
              </div>
            );
          })}
          
          {scenarios.length === 1 && (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center opacity-50 border-dashed border-2 border-white/20">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold text-white mb-2">Save Another Scenario</h3>
              <p className="text-[#94A3B8]">
                Go back to the Heat Map, adjust the Equity slider or Budget, and save a second scenario to compare them side-by-side.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
