// import { useState, useEffect, useMemo, useCallback } from 'react';
// import { findNearestPortfolioKey, computePortfolioStats, getBlockCentroids } from '../utils/portfolioUtils.js';

// export function usePortfolio(geojson) {
//   const [currentPortfolio, setCurrentPortfolio] = useState(null);
//   const [paretoData, setParetoData] = useState(null);
//   const [portfolioStats, setPortfolioStats] = useState({
//     totalCost: 0,
//     avgDeltaT: 0,
//     peopleProtected: 0,
//     interventionCounts: {},
//     neighborhoods: [],
//   });
//   const [alpha, setAlpha] = useState(0.4);
//   const [budget, setBudget] = useState(5.0);
//   const [loading, setLoading] = useState(true);

//   // Load static pareto_fronts data so ParetoChart still works
//   useEffect(() => {
//     let cancelled = false;
//     async function load() {
//       try {
//         const paretoRes = await fetch('/data/pareto_fronts.json').then(r => r.json());
//         if (cancelled) return;
//         setParetoData(paretoRes);
//         setLoading(false);
//       } catch (err) {
//         console.error('Failed to load portfolio data:', err);
//         setLoading(false);
//       }
//     }
//     load();
//     return () => { cancelled = true; };
//   }, []);

//   // Compute centroids from geojson
//   const blockCentroids = useMemo(() => {
//     if (!geojson) return {};
//     return getBlockCentroids(geojson);
//   }, [geojson]);

  // LIVE BACKEND OPTIMIZATION
  // const fetchPortfolio = async (loc, bud, alp) => {
  //   setLoading(true);
  //   try {
  //     const area = {
  //       'pmc-kothrud': 'Kothrud',
  //       'pmc-viman-nagar': 'Viman Nagar',
  //       'pmc-baner': 'Baner',
  //       'pcmc-wakad': 'Wakad',
  //       'pcmc-hinjawadi': 'Hinjawadi',
  //       'all': 'Other'
  //     }[loc] || 'Kothrud';

  //     const res = await fetch('http://127.0.0.1:8000/optimise', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         area: area,
  //         budget: bud * 10000000, 
  //         alpha: alp
  //       })
  //     });
  //     const data = await res.json();
      
  //     const mappedPortfolio = {
  //         interventions: data.selected_interventions || [],
  //         summary: data.summary || {}
  //     };
      
  //     setCurrentPortfolio(mappedPortfolio);
  //     setPortfolioStats(computePortfolioStats(mappedPortfolio));

  //   } catch (err) {
  //     console.error('Failed to optimise portfolio:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

//   const strategyToIconMap = {
//     "Cool Roofs": "cool_pavement",
//     "Urban Forest": "tree_planting",
//     "Permeable Rd": "cool_pavement", 
//     "Green Roofs": "green_roof"
//   };

//   const fetchPortfolio = async (locationName, budgetInCrores, alphaValue) => {
//     setLoading(true);
//     try {
//       // 1. Convert budget from Crores (e.g. 5) to raw Rupees (e.g. 50000000) for the Python backend
//       const rawBudget = budgetInCrores * 10000000;

//       // 2. Hit your FastAPI Backend!
//       const response = await fetch("http://127.0.0.1:8000/optimise", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           area: locationName,   // e.g., "Kothrud"
//           budget: rawBudget,    // e.g., 50000000
//           alpha: alphaValue     // e.g., 0.5
//         })
//       });

//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();

//       // 3. Format the API data into the exactly what your UI panels expect
//       const formattedStats = {
//         totalCost: (data.summary.total_budget - data.summary.remaining_budget) / 10000000, // Back to Crores
//         peopleProtected: data.summary.blocks_treated * 500, // Estimate 500 people per block
//         avgDeltaT: data.selected_interventions.reduce((sum, b) => sum + b.impact, 0) / (data.summary.blocks_treated || 1)
//       };

//       // 4. Format the markers for Mapbox
//       const formattedMarkers = data.selected_interventions.map((block) => ({
//         block_id: `BLK_${block.block_id}`,
//         type: strategyToIconMap[block.strategy] || "tree_planting",
//         position: [block.longitude, block.latitude], // Mapbox strictly wants [Lng, Lat]
//         delta_t: block.impact.toFixed(2),
//         cost_lakh: (block.cost / 100000).toFixed(1)
//       }));

//       // 5. Update the React state
//       setPortfolioStats(formattedStats);
//       setInterventionMarkers(formattedMarkers);
//       setCurrentPortfolio({ interventions: formattedMarkers }); // Assuming this powers your side panel

//     } catch (error) {
//       console.error("Failed to fetch optimized portfolio from backend:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get Pareto front data for current budget
//   const currentParetoFront = useMemo(() => {
//     if (!paretoData) return [];
//     const key = `budget_${budget.toFixed(1)}`;
//     if (paretoData[key]) return paretoData[key];
//     const keys = Object.keys(paretoData);
//     if (keys.length === 0) return [];
//     const budgets = keys.map(k => parseFloat(k.replace('budget_', '')));
//     let nearest = keys[0];
//     let minDist = Infinity;
//     budgets.forEach((b, i) => {
//       const d = Math.abs(b - budget);
//       if (d < minDist) { minDist = d; nearest = keys[i]; }
//     });
//     return paretoData[nearest] || [];
//   }, [paretoData, budget]);

//   // Get intervention markers with positions
//   const interventionMarkers = useMemo(() => {
//     if (!currentPortfolio?.interventions || !blockCentroids) return [];
//     return currentPortfolio.interventions
//       .filter(inv => blockCentroids[inv.block_id])
//       .map(inv => ({
//         ...inv,
//         position: blockCentroids[inv.block_id],
//       }));
//   }, [currentPortfolio, blockCentroids]);

//   const handleAlphaChange = useCallback((newAlpha) => {
//     setAlpha(Math.round(newAlpha * 10) / 10);
//   }, []);

//   const handleBudgetChange = useCallback((newBudget) => {
//     setBudget(Math.round(newBudget * 2) / 2);
//   }, []);

//   return {
//     alpha,
//     budget,
//     setAlpha: handleAlphaChange,
//     setBudget: handleBudgetChange,
//     currentPortfolio,
//     portfolioStats,
//     currentParetoFront,
//     fetchPortfolio,
//     interventionMarkers,
//     loading
//   };
// }





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
  const [alpha, setAlpha] = useState(0.5);
  const [budget, setBudget] = useState(5.0);
  const [loading, setLoading] = useState(true);

  // 🐛 FIX 1: We explicitly create the state for the markers here
  const [interventionMarkers, setInterventionMarkers] = useState([]);

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

  const strategyToIconMap = {
    "Cool Roofs": "cool_pavement",
    "Urban Forest": "tree_planting",
    "Permeable Rd": "cool_pavement", 
    "Green Roofs": "green_roof"
  };

  // const fetchPortfolio = async (locationName, budgetInCrores, alphaValue) => {
  //   setLoading(true);
  //   try {
  //     // 1. Convert budget from Crores (e.g. 5) to raw Rupees (e.g. 50000000) for the Python backend
  //     const rawBudget = budgetInCrores * 10000000;

  //     // 2. Hit your FastAPI Backend!
  //     const response = await fetch("http://127.0.0.1:8000/optimise", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         area: locationName,   // e.g., "Kothrud"
  //         budget: rawBudget,    // e.g., 50000000
  //         alpha: alphaValue     // e.g., 0.5
  //       })
  //     });

  //     if (!response.ok) throw new Error("Network response was not ok");
  //     const data = await response.json();

  //     // 3. Format the API data into exactly what your UI panels expect
  //     // const formattedStats = {
  //     //   totalCost: (data.summary.total_budget - data.summary.remaining_budget) / 10000000, // Back to Crores
  //     //   peopleProtected: data.summary.blocks_treated * 500, // Estimate 500 people per block
  //     //   avgDeltaT: data.selected_interventions.reduce((sum, b) => sum + b.impact, 0) / (data.summary.blocks_treated || 1)
  //     // };

  //     // 3. Format the API data into exactly what your UI panels expect
  //     const blocksTreated = data.summary.blocks_treated || 0;
      
  //     // PREVENT NaN: Only do the math if we actually have blocks!
  //     const safeAvgDeltaT = blocksTreated > 0 
  //       ? data.selected_interventions.reduce((sum, b) => sum + (b.impact || 0), 0) / blocksTreated 
  //       : 0;

  //     const formattedStats = {
  //       totalCost: (data.summary.total_budget - data.summary.remaining_budget) / 10000000, // Crores
  //       peopleProtected: blocksTreated * 500, // Estimate 500 people per block
  //       avgDeltaT: safeAvgDeltaT
  //     };

  //     // 4. Format the markers for Mapbox
  //     const formattedMarkers = data.selected_interventions.map((block) => ({
  //       block_id: `BLK_${block.block_id}`,
  //       type: strategyToIconMap[block.strategy] || "tree_planting",
  //       position: [block.longitude, block.latitude], // 📍 Mapbox strictly wants [Lng, Lat] straight from Python
  //       delta_t: block.impact.toFixed(2),
  //       cost_lakh: (block.cost / 100000).toFixed(1)
  //     }));

  //     // 5. Update the React state
  //     setPortfolioStats(formattedStats);
  //     setInterventionMarkers(formattedMarkers); // ✅ This works now because we added the state at the top
  //     setCurrentPortfolio({ interventions: formattedMarkers }); 

  //   } catch (error) {
  //     console.error("Failed to fetch optimized portfolio from backend:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchPortfolio = async (locationName, budgetInCrores, alphaValue) => {
    setLoading(true);
    // 🔍 LOG 1: Check what is actually being sent to Python!
    console.log(`📡 Sending to Backend -> Area: ${locationName}, Budget: ${budgetInCrores}, Alpha: ${alphaValue}`);
    
    try {
      const rawBudget = budgetInCrores * 10000000;

      const response = await fetch("http://127.0.0.1:8000/optimise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: locationName,
          budget: rawBudget,
          alpha: alphaValue
        })
      });

      // 🔍 LOG 2: Did the server reject it (CORS) or accept it?
      console.log(`📥 Raw Response Status:`, response.status);

      if (!response.ok) {
         const errorText = await response.text();
         console.error("❌ Backend Error:", errorText);
         throw new Error("Network response was not ok");
      }

      const data = await response.json();
      
      // 🔍 LOG 3: See exactly what Python sent back!
      console.log("✅ Backend Data Received:", data);

      const blocksTreated = data.summary.blocks_treated || 0;
      
      const safeAvgDeltaT = blocksTreated > 0 
        ? data.selected_interventions.reduce((sum, b) => sum + (b.impact || 0), 0) / blocksTreated 
        : 0;

      const formattedStats = {
        totalCost: (data.summary.total_budget - data.summary.remaining_budget) / 10000000,
        peopleProtected: blocksTreated * 500,
        avgDeltaT: safeAvgDeltaT
      };

      const formattedMarkers = data.selected_interventions.map((block) => ({
        block_id: `BLK_${block.block_id}`,
        type: strategyToIconMap[block.strategy] || "tree_planting",
        position: [block.longitude, block.latitude], 
        latitude: block.latitude,   // 📍 Forces Latitude into the console array
        longitude: block.longitude, // 📍 Forces Longitude into the console array
        delta_t: block.impact.toFixed(2),
        cost_lakh: (block.cost / 100000).toFixed(1)
      }));

      // 🔍 LOG 4: Check if the markers were formatted correctly for Mapbox
      console.log("📍 Markers ready for Mapbox:", formattedMarkers);

      setPortfolioStats(formattedStats);
      setInterventionMarkers(formattedMarkers); 
      setCurrentPortfolio({ interventions: formattedMarkers }); 

    } catch (error) {
      // 🔍 LOG 5: Catch any silent UI crashes!
      console.error("🛑 FETCH CATCH ERROR:", error);
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

  // 🐛 FIX 2: We deleted the old `useMemo` for interventionMarkers here 
  // because we already set it properly in step 4 of the fetch function!

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