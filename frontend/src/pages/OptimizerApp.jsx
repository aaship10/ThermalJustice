import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Components — Shared
import NavBar from '../components/shared/NavBar.jsx';
import Toast from '../components/shared/Toast.jsx';

// Components — Map
import MapView from '../components/map/MapView.jsx';
import LayerToggle from '../components/map/LayerToggle.jsx';
import Legend from '../components/map/Legend.jsx';
import InterventionMarkers from '../components/map/InterventionMarkers.jsx';

// Components — Panels
import BlockDetail from '../components/panels/BlockDetail.jsx';
import PortfolioPanel from '../components/panels/PortfolioPanel.jsx';
import ParetoChart from '../components/panels/ParetoChart.jsx';
import ComparisonView from '../components/panels/ComparisonView.jsx';
import DataSourcesModal from '../components/panels/DataSourcesModal.jsx';
import TempHistogram from '../components/panels/TempHistogram.jsx';
import CostEffChart from '../components/panels/CostEffChart.jsx';
import ScenarioComparison from '../components/panels/ScenarioComparison.jsx';

// Components — Controls
import ControlBar from '../components/controls/ControlBar.jsx';

// Hooks
import { useMapData } from '../hooks/useMapData.js';
import { usePortfolio } from '../hooks/usePortfolio.js';

export default function OptimizerApp() {
  // Data hooks
  const { geojson, interventionEffects, loading: mapLoading } = useMapData();
  const {
    alpha,
    budget,
    setAlpha,
    setBudget,
    currentPortfolio,
    portfolioStats,
    currentParetoFront,
    interventionMarkers,
    loading: portfolioLoading,
    fetchPortfolio
  } = usePortfolio(geojson);

  // UI State
  const [activeTab, setActiveTab] = useState('Heat Map');
  const [activeLayer, setActiveLayer] = useState('tvs');
  const [is3D, setIs3D] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [hoveredBlockId, setHoveredBlockId] = useState(null);
  const [isOptimised, setIsOptimised] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showDataSources, setShowDataSources] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lstToggled, setLstToggled] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [showScenarioComparison, setShowScenarioComparison] = useState(false);
  const [targetLocation, setTargetLocation] = useState('all');

  const locationHook = useLocation();

  // Restore history state from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(locationHook.search);
    const queryLocation = searchParams.get('location');
    const queryBudget = searchParams.get('budget');
    
    if (queryLocation && queryBudget) {
      const b = parseFloat(queryBudget);
      setBudget(b);
      setAlpha(0.5); // CRITICAL LOGIC: default alpha
      
      // We also pretend location represents something if we had global location state,
      // but since 'location' isn't explicitly active in OptimizerApp context, we just restore the portfolio parameters.
      
      setIsOptimised(true);
      setShowPortfolio(true);
      setToastMessage(`Restored query: ${queryLocation} at ₹${b.toFixed(1)}Cr, α=0.5`);
      setShowToast(true);
    }
  }, [locationHook.search, setBudget, setAlpha]);


  // Layer toggle handler — shows toast on first LST toggle
  const handleLayerChange = useCallback((layer) => {
    setActiveLayer(layer);
    if (layer === 'lst' && !lstToggled) {
      setLstToggled(true);
      setToastMessage('Temperature alone is the wrong metric. See how vulnerability shifts.');
      setShowToast(true);
    }
  }, [lstToggled]);

  // Block click handler
  const handleBlockClick = useCallback((properties) => {
    setSelectedBlock(properties);
  }, []);

  // Block hover handler
  const handleBlockHover = useCallback((properties) => {
    setHoveredBlockId(properties?.block_id || null);
  }, []);

// Helper function to translate names consistently for both the button and the sliders
  const getBackendLocationName = useCallback((rawLocation) => {
    if (rawLocation === 'all') return 'All';
    let cleanName = rawLocation.replace(/^(pmc-|pcmc-)/, '');
    return cleanName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  // Real-time Knapsack updating pipeline:
  // After the user commits the "Optimise" button once, any further slider changes 
  // will automatically trigger the Python machine learning backend processing.
  React.useEffect(() => {
    if (isOptimised) {
      const debounce = setTimeout(async () => {
        const backendName = getBackendLocationName(targetLocation);
        console.log(`Slider auto-update for: ${backendName}`);
        await fetchPortfolio(backendName, budget, alpha);
      }, 300);
      return () => clearTimeout(debounce);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget, alpha, targetLocation, isOptimised]);

  // Optimise handler (Main button click)
  const handleOptimise = useCallback(async () => {
    const backendLocationName = getBackendLocationName(targetLocation);
    console.log(`Button clicked for: ${backendLocationName}`);

    await fetchPortfolio(backendLocationName, budget, alpha);
    
    setIsOptimised(true);
    setShowPortfolio(true);
    setToastMessage(`Portfolio optimised: ₹${budget.toFixed(1)}Cr budget, α=${alpha.toFixed(1)}`);
    setShowToast(true);
  }, [budget, alpha, targetLocation, fetchPortfolio, getBackendLocationName]);

  // Tab change — scroll back to top if needed
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    if (tab === 'Analytics') {
      setShowComparison(false);
    }
  }, []);


  // Alpha select from Pareto chart
  const handleAlphaSelect = useCallback((newAlpha) => {
    setAlpha(newAlpha);
    setIsOptimised(true);
    setShowPortfolio(true);
    setActiveTab('Heat Map');
  }, [setAlpha]);

  // Save scenario
  const handleSaveScenario = useCallback(() => {
    if (savedScenarios.length >= 2) {
      setToastMessage('Maximum 2 scenarios can be saved for comparison. Please remove one first (view them in Comparison View).');
      setShowToast(true);
      return;
    }
    const newScenario = {
      id: Date.now(),
      alpha,
      budget,
      stats: portfolioStats,
      portfolio: currentPortfolio,
      date: new Date().toISOString()
    };
    setSavedScenarios(prev => [...prev, newScenario]);
    setToastMessage('Scenario saved for comparison.');
    setShowToast(true);
  }, [alpha, budget, portfolioStats, currentPortfolio, savedScenarios]);

  // Export PDF handler (basic)
  const handleExport = useCallback(async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('ThermalJustice — Portfolio Report', 20, 30);
      doc.setFontSize(12);
      doc.text(`Budget: ₹${budget.toFixed(1)} Cr`, 20, 50);
      doc.text(`Equity Weight (α): ${alpha.toFixed(1)}`, 20, 60);
      doc.text(`Avg ΔT: ${portfolioStats?.avgDeltaT?.toFixed(1) || 'N/A'}°C`, 20, 70);
      doc.text(`People Protected: ${portfolioStats?.peopleProtected?.toLocaleString() || 'N/A'}`, 20, 80);
      doc.text(`Total Cost: ₹${portfolioStats?.totalCost?.toFixed(1) || 'N/A'} Cr`, 20, 90);
      doc.text(`Interventions: ${currentPortfolio?.interventions?.length || 0}`, 20, 100);
      doc.save('thermaljustice-report.pdf');
      setToastMessage('PDF report exported successfully');
      setShowToast(true);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [budget, alpha, portfolioStats, currentPortfolio]);

  // Compute filtered GeoJSON based on active selection and "Optimise" toggle
    const displayedGeojson = React.useMemo(() => {
    if (!geojson) return null;
    
    // ✅ If NOT optimised, show the whole city map!
    // This ensures the map isn't empty when the page first loads.
    if (!isOptimised) return geojson;

    const LOCATION_PREFIXES = {
      'pmc-kothrud': 'KTR',
      'pmc-yerawada': 'YRW',
      'pmc-koregaon-park': 'KGP',
      'pmc-hadapsar': 'HDP',
      'pcmc-bhosari': 'BHS'
    };

    const prefix = LOCATION_PREFIXES[targetLocation];
    if (prefix) {
      return {
        ...geojson,
        features: geojson.features.filter(f => {
           const idStr = String(f.properties.block_id || '');
           return idStr.startsWith(prefix);
        })
      };
    }
    
    // If "All" or a region without a specific mock prefix is chosen, just show whatever is in the mock DB.
    return geojson;
  }, [geojson, isOptimised, targetLocation]);

  // Loading screen
    if (mapLoading && !geojson) {
      return (
        <div className="loading-screen">
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ThermalJustice
          </h1>
          <div className="loading-progress-bar">
            <div
              className="loading-progress-fill"
              style={{ width: '60%' }}
            />
          </div>
          <p className="text-sm text-text-secondary">Loading Pune's thermal story...</p>
        </div>
    );
  }


  return (
    <div id="optimizer-app" className="relative h-screen w-full overflow-hidden bg-bg-dark">
      {/* Nav Bar */}
      <NavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onInfoClick={() => setShowDataSources(true)}
        onExportClick={handleExport}
        onModelCardsClick={() => setShowDataSources(true)}
      />

      {/* Main Content Area */}
      <div className="absolute inset-0 top-14">
        {activeTab === 'Heat Map' && (
          <>
            {/* Map Canvas */}
            <MapView
            //   geojson={displayedGeojson}
            //   activeLayer={activeLayer}
            //   is3D={is3D}
            //   onBlockClick={handleBlockClick}
            //   onBlockHover={handleBlockHover}
            //   hoveredBlockId={hoveredBlockId}
            //   selectedBlockId={selectedBlock?.block_id}
            // >
            //   {/* Intervention Markers */}
            //   {isOptimised && (
            //     <InterventionMarkers
            //       markers={interventionMarkers}
            //       geojson={displayedGeojson}
            //     />
            //   )}
                  geojson={displayedGeojson}
                  activeLayer={activeLayer}
                  is3D={is3D}
                  onBlockClick={handleBlockClick}
                  onBlockHover={handleBlockHover}
                  hoveredBlockId={hoveredBlockId}
                  selectedBlockId={selectedBlock?.block_id}
                  interventionMarkers={interventionMarkers} // 👈 Add this new prop!
                  isOptimised={isOptimised}               // 👈 Add this to toggle Grid Mode
            >
                  {isOptimised && (
                    <InterventionMarkers
                      markers={interventionMarkers}
                      geojson={displayedGeojson}
                    />
                  )}
            </MapView> 

            {/* Layer Toggle */}
            <LayerToggle
              activeLayer={activeLayer}
              is3D={is3D}
              onLayerChange={handleLayerChange}
              onToggle3D={() => setIs3D(!is3D)}
            />

            {/* Legend */}
            <Legend activeLayer={activeLayer} />

            {/* Block Detail Panel */}
            <BlockDetail
              block={selectedBlock}
              interventionEffects={interventionEffects}
              onClose={() => setSelectedBlock(null)}
              portfolioOpen={showPortfolio}
            />

            {/* Portfolio Panel */}
            <PortfolioPanel
              portfolio={currentPortfolio}
              portfolioStats={portfolioStats}
              budget={budget}
              visible={showPortfolio}
              onSaveScenario={handleSaveScenario}
            />

            {/* Floating Action Buttons */}
            {isOptimised && (
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 flex gap-4">
                <button
                  onClick={() => setShowComparison(true)}
                  className="glass-card px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                >
                  🔄 Swipe Comparison
                </button>
                {savedScenarios.length > 0 && (
                  <button
                    onClick={() => setShowScenarioComparison(true)}
                    className="glass-card px-6 py-2.5 text-sm font-semibold text-[#10B981] hover:bg-white/10 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[#10B981]/30"
                  >
                    ⚖️ View Scenarios ({savedScenarios.length})
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'Analytics' && (
          <div className="h-full overflow-y-auto p-8 pb-32" style={{ backgroundColor: '#0B1929' }}>
            <div className="max-w-4xl mx-auto space-y-8">
              <ParetoChart
                paretoData={currentParetoFront}
                currentAlpha={alpha}
                onAlphaSelect={handleAlphaSelect}
              />
              <TempHistogram geojson={geojson} />
              <CostEffChart interventionEffects={interventionEffects} />
            </div>
          </div>
        )}

        {activeTab === 'About' && (
          <div className="h-full overflow-y-auto p-8" style={{ backgroundColor: '#0B1929' }}>
            <div className="max-w-3xl mx-auto">
              <h2
                className="text-4xl font-bold text-white mb-6"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                About ThermalJustice
              </h2>
              <div className="space-y-6 text-text-secondary leading-relaxed">
                <p>
                  ThermalJustice is an urban heat intervention intelligence platform for Indian cities.
                  It answers the critical question: <em className="text-white">"Given my budget and my city's
                  urban heat data, where do I plant trees, install cool pavements, build green roofs,
                  and create pocket parks to save the most vulnerable lives equitably?"</em>
                </p>
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Technical Stack</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• <span className="text-white font-medium">Graph Neural Network (GNN)</span> — Thermal Vulnerability Score prediction</li>
                    <li>• <span className="text-white font-medium">SHAP Analysis</span> — Explainable AI for risk driver identification</li>
                    <li>• <span className="text-white font-medium">Pareto-Optimal Optimization</span> — Multi-objective knapsack with equity weighting</li>
                    <li>• <span className="text-white font-medium">Satellite Remote Sensing</span> — Landsat 8/9 LST + Sentinel-2 NDVI</li>
                  </ul>
                </div>
                <p>
                  Built for the Pune Municipal Corporation and urban planners across India.
                  Designed to make equity-weighted climate adaptation decisions transparent,
                  data-driven, and actionable.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Control Bar — always visible on Heat Map tab */}
        {activeTab === 'Heat Map' && (
          <ControlBar
            location={targetLocation}
            onLocationChange={setTargetLocation}
            budget={budget}
            alpha={alpha}
            onBudgetChange={setBudget}
            onAlphaChange={setAlpha}
            onOptimise={handleOptimise}
            portfolioStats={portfolioStats}
            isOptimised={isOptimised}
          />
        )}
      </div>

      {/* Toast */}
      <Toast
        message={toastMessage}
        visible={showToast}
        onDismiss={() => setShowToast(false)}
      />

      {/* Comparison View */}
      {showComparison && (
        <ComparisonView onClose={() => setShowComparison(false)} />
      )}

      {/* Data Sources Modal */}
      {showDataSources && (
        <DataSourcesModal onClose={() => setShowDataSources(false)} />
      )}

      {/* Scenario Comparison View */}
      {showScenarioComparison && (
        <ScenarioComparison 
          scenarios={savedScenarios} 
          onClose={() => setShowScenarioComparison(false)}
          onRestore={(scenario) => {
            setBudget(scenario.budget);
            setAlpha(scenario.alpha);
            setShowScenarioComparison(false);
            setToastMessage('Restored scenario parameters.');
            setShowToast(true);
          }}
        />
      )}
    </div>
  );
}
