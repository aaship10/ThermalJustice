// import { useState, useEffect } from 'react';

// /**
//  * useMapData — Loads GeoJSON and intervention effects from static files in /public/data/.
//  */
// export function useMapData() {
//   const [geojson, setGeojson] = useState(null);
//   const [interventionEffects, setInterventionEffects] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadData() {
//       try {
//         const [geoRes, effectsRes] = await Promise.all([
//           fetch('/data/intervention_effects.json').then(r => r.json())
//         ]);

//         if (cancelled) return;
//         setGeojson(geoRes);
//         setInterventionEffects(effectsRes);
//         setLoading(false);
//       } catch (err) {
//         if (cancelled) return;
//         console.error('Failed to load map data:', err);
//         setError(err.message);
//         setLoading(false);
//       }
//     }

//     loadData();
//     return () => { cancelled = true; };
//   }, []);

//   return { geojson, interventionEffects, loading, error };
// }


import { useState, useEffect } from 'react';

export function useMapData() {
  const [geojson, setGeojson] = useState(null);
  const [interventionEffects, setInterventionEffects] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        console.log("🛠️ Attempting to fetch city data...");
        const [pmc, pcmc, effects] = await Promise.all([
          fetch('/data/pune-admin-wards.geojson').then(r => r.json()),
          fetch('/data/pcmc-electoral-wards.geojson').then(r => r.json()),
          fetch('/data/intervention_effects.json').then(r => r.json())
        ]);

        const merged = {
          type: 'FeatureCollection',
          features: [...pmc.features, ...pcmc.features]
        };

        console.log("✅ Data Loaded Successfully:", { wardCount: merged.features.length });
        setGeojson(merged);
        setInterventionEffects(effects);
        setLoading(false);
      } catch (err) {
        console.error("❌ MAP DATA ERROR:", err.message);
        // Fallback: If files are missing, don't stay in loading forever
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return { geojson, interventionEffects, loading };
}