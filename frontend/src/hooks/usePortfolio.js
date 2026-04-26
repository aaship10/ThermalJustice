import { useState, useEffect, useMemo, useCallback } from 'react';
import { findNearestPortfolioKey, computePortfolioStats, getBlockCentroids } from '../utils/portfolioUtils.js';

export function usePortfolio(geojson) {
  const [currentPortfolio, setCurrentPortfolio] = useState(null);
  const [paretoData, setParetoData] = useState(null);
  const [portfolioStats, setPortfolioStats] = useState({
    totalCost: 0,
    avgDeltaT: 0,
    peopleProtected: 0,
    interventionCounts: {},
    neighborhoods: [],
  });
  const [alpha, setAlpha] = useState(0.4);
  const [budget, setBudget] = useState(5.0);
  const [loading, setLoading] = useState(true);

  // Load static pareto_fronts data so ParetoChart still works
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const paretoRes = await fetch('/data/pareto_fronts.json').then(r => r.json());
        if (cancelled) return;
        setParetoData(paretoRes);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load portfolio data:', err);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Compute centroids from geojson
  const blockCentroids = useMemo(() => {
    if (!geojson) return {};
    return getBlockCentroids(geojson);
  }, [geojson]);

  // LIVE BACKEND OPTIMIZATION
  const fetchPortfolio = async (loc, bud, alp) => {
    setLoading(true);
    try {
      const area = {
        'pmc-kothrud': 'Kothrud',
        'pmc-viman-nagar': 'Viman Nagar',
        'pmc-baner': 'Baner',
        'pcmc-wakad': 'Wakad',
        'pcmc-hinjawadi': 'Hinjawadi',
        'all': 'Other'
      }[loc] || 'Kothrud';

      const res = await fetch('http://127.0.0.1:8000/optimise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: area,
          budget: bud * 10000000, 
          alpha: alp
        })
      });
      const data = await res.json();
      
      const mappedPortfolio = {
          interventions: data.selected_interventions || [],
          summary: data.summary || {}
      };
      
      setCurrentPortfolio(mappedPortfolio);
      setPortfolioStats(computePortfolioStats(mappedPortfolio));

    } catch (err) {
      console.error('Failed to optimise portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get Pareto front data for current budget
  const currentParetoFront = useMemo(() => {
    if (!paretoData) return [];
    const key = `budget_${budget.toFixed(1)}`;
    if (paretoData[key]) return paretoData[key];
    const keys = Object.keys(paretoData);
    if (keys.length === 0) return [];
    const budgets = keys.map(k => parseFloat(k.replace('budget_', '')));
    let nearest = keys[0];
    let minDist = Infinity;
    budgets.forEach((b, i) => {
      const d = Math.abs(b - budget);
      if (d < minDist) { minDist = d; nearest = keys[i]; }
    });
    return paretoData[nearest] || [];
  }, [paretoData, budget]);

  // Get intervention markers with positions
  const interventionMarkers = useMemo(() => {
    if (!currentPortfolio?.interventions || !blockCentroids) return [];
    return currentPortfolio.interventions
      .filter(inv => blockCentroids[inv.block_id])
      .map(inv => ({
        ...inv,
        position: blockCentroids[inv.block_id],
      }));
  }, [currentPortfolio, blockCentroids]);

  const handleAlphaChange = useCallback((newAlpha) => {
    setAlpha(Math.round(newAlpha * 10) / 10);
  }, []);

  const handleBudgetChange = useCallback((newBudget) => {
    setBudget(Math.round(newBudget * 2) / 2);
  }, []);

  return {
    alpha,
    budget,
    setAlpha: handleAlphaChange,
    setBudget: handleBudgetChange,
    currentPortfolio,
    portfolioStats,
    currentParetoFront,
    fetchPortfolio,
    interventionMarkers,
    loading
  };
}
