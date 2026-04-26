import { useState, useCallback } from 'react';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const loadGeoJSON = async () => {
  const res = await fetch('/data/pune_blocks.geojson');
  if (!res.ok) throw new Error('Failed to load GeoJSON');
  const data = await res.json();
  window.__TJ_GEOJSON = data;
};

const loadInterventionEffects = async () => {
  const res = await fetch('/data/intervention_effects.json');
  if (!res.ok) throw new Error('Failed to load Intervention Effects');
  window.__TJ_INTERVENTIONS = await res.json();
};

const loadPortfolios = async () => {
  try {
    const res = await fetch('/data/portfolios.json');
    if (!res.ok) throw new Error('portfolios.json missing or failed to fetch');
    const data = await res.json();
    window.__TJ_PORTFOLIOS = data;
    window.__TJ_PORTFOLIO_INDEX = Object.keys(data);
  } catch (err) {
    console.warn('ThermalJustice Loader Warning:', err.message);
    window.__TJ_PORTFOLIOS = {};
    window.__TJ_PORTFOLIO_INDEX = [];
  }
};

const waitForMapbox = () => new Promise(resolve => {
  if (window.__TJ_MAP_READY) {
    resolve();
    return;
  }
  window.addEventListener('tj:map:ready', resolve, { once: true });
  setTimeout(resolve, 3000);
});

export const useAppLoader = () => {
  const [loaderState, setLoaderState] = useState({
    visible: false,
    progress: 0,
    currentStage: -1,
    stageStatuses: ['pending', 'pending', 'pending', 'pending'],
    stageTimes: [null, null, null, null],
    done: false,
  });

  const startLoading = useCallback(async (onComplete) => {
    const totalStart = performance.now();
    
    setLoaderState(s => ({ ...s, visible: true, currentStage: 0 }));
    
    const stageStart = [0, 0, 0, 0];
    
    // Stage 0: Load GeoJSON
    stageStart[0] = performance.now();
    setLoaderState(s => ({
      ...s,
      stageStatuses: ['loading', 'pending', 'pending', 'pending'],
      progress: 0,
    }));
    await loadGeoJSON();
    const t0 = Math.round(performance.now() - stageStart[0]);
    
    setLoaderState(s => ({
      ...s,
      stageStatuses: ['done', 'loading', 'pending', 'pending'],
      stageTimes: [t0, null, null, null],
      progress: 30,
      currentStage: 1,
    }));
    
    // Stage 1: Load intervention effects JSON
    stageStart[1] = performance.now();
    await loadInterventionEffects();
    const t1 = Math.round(performance.now() - stageStart[1]);
    
    setLoaderState(s => ({
      ...s,
      stageStatuses: ['done', 'done', 'loading', 'pending'],
      stageTimes: [t0, t1, null, null],
      progress: 55,
      currentStage: 2,
    }));
    
    // Stage 2: Load portfolios JSON
    stageStart[2] = performance.now();
    await loadPortfolios();
    const t2 = Math.round(performance.now() - stageStart[2]);
    
    setLoaderState(s => ({
      ...s,
      stageStatuses: ['done', 'done', 'done', 'loading'],
      stageTimes: [t0, t1, t2, null],
      progress: 85,
      currentStage: 3,
    }));
    
    // Stage 3: Wait for Mapbox (MapLibre) to signal load event
    stageStart[3] = performance.now();
    await waitForMapbox();
    const t3 = Math.round(performance.now() - stageStart[3]);
    
    setLoaderState(s => ({
      ...s,
      stageStatuses: ['done', 'done', 'done', 'done'],
      stageTimes: [t0, t1, t2, t3],
      progress: 100,
      currentStage: -1,
    }));

    // Enforce a minimum display time of 1500ms
    const elapsedTime = performance.now() - totalStart;
    if (elapsedTime < 1500) {
      await sleep(1500 - elapsedTime);
    } else {
      await sleep(400); // just hold at 100% for 400ms
    }
    
    // Trigger exit animation
    setLoaderState(s => ({ ...s, done: true }));
    await sleep(600); // wait for exit animation to finish
    onComplete();
  }, []);

  return { loaderState, startLoading };
};
