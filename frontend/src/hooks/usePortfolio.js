import { useState, useEffect, useMemo, useCallback } from 'react';
import { findNearestPortfolioKey, computePortfolioStats, getBlockCentroids } from '../utils/portfolioUtils.js';

/**
 * usePortfolio — Manages portfolio state, loads from /public/data/,
 * handles α × budget lookups with nearest-key snapping.
 */
export function usePortfolio(geojson) {
  const [portfoliosData, setPortfoliosData] = useState(null);
  const [paretoData, setParetoData] = useState(null);
  const [alpha, setAlpha] = useState(0.4);
  const [budget, setBudget] = useState(5.0);
  const [loading, setLoading] = useState(true);

  // Load portfolio data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [portfolioRes, paretoRes] = await Promise.all([
          fetch('/data/portfolios.json').then(r => r.json()),
          fetch('/data/pareto_fronts.json').then(r => r.json()),
        ]);
        if (cancelled) return;
        setPortfoliosData(portfolioRes);
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

  // Find the current portfolio using nearest-key snapping
  const currentPortfolioKey = useMemo(() => {
    if (!portfoliosData) return null;
    return findNearestPortfolioKey(portfoliosData, alpha, budget);
  }, [portfoliosData, alpha, budget]);

  const currentPortfolio = useMemo(() => {
    if (!portfoliosData || !currentPortfolioKey) return null;
    return portfoliosData[currentPortfolioKey];
  }, [portfoliosData, currentPortfolioKey]);

  // Compute stats
  const portfolioStats = useMemo(() => {
    return computePortfolioStats(currentPortfolio);
  }, [currentPortfolio]);

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
    currentPortfolioKey,
    portfolioStats,
    currentParetoFront,
    interventionMarkers,
    blockCentroids,
    loading,
  };
}
