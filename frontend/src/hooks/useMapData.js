import { useState, useEffect } from 'react';

/**
 * useMapData — Loads GeoJSON and intervention effects from static files in /public/data/.
 */
export function useMapData() {
  const [geojson, setGeojson] = useState(null);
  const [interventionEffects, setInterventionEffects] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [geoRes, effectsRes] = await Promise.all([
          fetch('/data/pune_blocks.geojson').then(r => r.json()),
          fetch('/data/intervention_effects.json').then(r => r.json()),
        ]);

        if (cancelled) return;
        setGeojson(geoRes);
        setInterventionEffects(effectsRes);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load map data:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  return { geojson, interventionEffects, loading, error };
}
