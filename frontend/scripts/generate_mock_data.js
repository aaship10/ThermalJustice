/**
 * ThermalJustice — Mock Data Generator
 * Generates realistic pune_blocks.geojson, intervention_effects.json, and portfolios.json
 * 
 * Run: node scripts/generate_mock_data.js
 * Output: src/data/
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

mkdirSync(DATA_DIR, { recursive: true });

// Seeded random for reproducibility
let seed = 42;
function random() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}

function randomInRange(min, max) {
  return min + random() * (max - min);
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Pune neighborhoods with their characteristic heat profiles
const NEIGHBORHOODS = [
  { name: 'Yerawada', prefix: 'YRW', count: 140, tvsBase: 0.78, lstBase: 45.5, lat: 18.5550, lng: 73.8900, povertyBase: 0.72 },
  { name: 'Kothrud', prefix: 'KTR', count: 130, tvsBase: 0.45, lstBase: 38.2, lat: 18.5074, lng: 73.8077, povertyBase: 0.35 },
  { name: 'Koregaon Park', prefix: 'KGP', count: 110, tvsBase: 0.22, lstBase: 34.8, lat: 18.5362, lng: 73.8940, povertyBase: 0.15 },
  { name: 'Hadapsar', prefix: 'HDP', count: 120, tvsBase: 0.65, lstBase: 42.1, lat: 18.5089, lng: 73.9260, povertyBase: 0.58 },
  { name: 'Bhosari', prefix: 'BHS', count: 100, tvsBase: 0.72, lstBase: 44.0, lat: 18.6298, lng: 73.8500, povertyBase: 0.65 },
];

// Generate polygon grid cells around each neighborhood center
function generatePolygon(centerLat, centerLng, index, gridSize) {
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  const cellSize = 0.003; // ~330m cells
  const baseLat = centerLat - (gridSize / 2) * cellSize + row * cellSize;
  const baseLng = centerLng - (gridSize / 2) * cellSize + col * cellSize;
  
  return {
    type: 'Polygon',
    coordinates: [[
      [baseLng, baseLat],
      [baseLng + cellSize, baseLat],
      [baseLng + cellSize, baseLat + cellSize],
      [baseLng, baseLat + cellSize],
      [baseLng, baseLat],
    ]]
  };
}

function getCentroid(geometry) {
  const coords = geometry.coordinates[0];
  const lngs = coords.slice(0, -1).map(c => c[0]);
  const lats = coords.slice(0, -1).map(c => c[1]);
  return [
    lngs.reduce((a, b) => a + b, 0) / lngs.length,
    lats.reduce((a, b) => a + b, 0) / lats.length
  ];
}

// SHAP feature names
const SHAP_FEATURES = ['lst_mean', 'poverty_proxy', 'elderly_frac', 'ndvi', 'impervious'];

const features = [];
const interventionEffects = {};

for (const hood of NEIGHBORHOODS) {
  const gridSize = Math.ceil(Math.sqrt(hood.count));
  for (let i = 0; i < hood.count; i++) {
    const blockId = `${hood.prefix}_${String(i + 1).padStart(3, '0')}`;
    const geometry = generatePolygon(hood.lat, hood.lng, i, gridSize);
    
    // Add spatial variation
    const spatialNoise = randomInRange(-0.15, 0.15);
    const tvs = clamp(hood.tvsBase + spatialNoise + randomInRange(-0.08, 0.08), 0.0, 1.0);
    const lstMean = clamp(hood.lstBase + spatialNoise * 15 + randomInRange(-2, 2), 28, 52);
    const lstMax = lstMean + randomInRange(1.5, 4.5);
    const ndvi = clamp(0.55 - tvs * 0.5 + randomInRange(-0.05, 0.05), 0.02, 0.65);
    const canopyFrac = clamp(ndvi * 0.8 + randomInRange(-0.05, 0.05), 0.01, 0.55);
    const impervious = clamp(0.3 + tvs * 0.5 + randomInRange(-0.08, 0.08), 0.15, 0.95);
    const bldgDensity = Math.round(40 + tvs * 160 + randomInRange(-20, 20));
    const canyonAr = clamp(0.5 + tvs * 1.2 + randomInRange(-0.2, 0.2), 0.3, 2.5);
    const popDensity = Math.round(5000 + tvs * 18000 + randomInRange(-2000, 2000));
    const elderlyFrac = clamp(0.08 + randomInRange(-0.04, 0.1), 0.04, 0.28);
    const povertyProxy = clamp(hood.povertyBase + randomInRange(-0.12, 0.12), 0.05, 0.95);
    const parkDist = Math.round(100 + (1 - ndvi) * 1200 + randomInRange(-100, 200));
    const roadFrac = clamp(0.12 + randomInRange(-0.05, 0.1), 0.05, 0.35);

    // SHAP values — positive = increases risk, negative = decreases
    const shapLstMean = clamp((lstMean - 38) * 0.02 + randomInRange(-0.05, 0.05), -0.3, 0.5);
    const shapPovertyProxy = clamp(povertyProxy * 0.4 + randomInRange(-0.05, 0.05), -0.1, 0.5);
    const shapElderlyFrac = clamp(elderlyFrac * 1.2 + randomInRange(-0.05, 0.05), -0.05, 0.35);
    const shapNdvi = clamp(-ndvi * 0.5 + randomInRange(-0.03, 0.03), -0.35, 0.05);
    const shapImpervious = clamp(impervious * 0.2 + randomInRange(-0.03, 0.03), -0.05, 0.25);

    const feature = {
      type: 'Feature',
      geometry,
      properties: {
        block_id: blockId,
        neighborhood: hood.name,
        tvs: Math.round(tvs * 100) / 100,
        lst_mean: Math.round(lstMean * 10) / 10,
        lst_max: Math.round(lstMax * 10) / 10,
        ndvi: Math.round(ndvi * 100) / 100,
        canopy_frac: Math.round(canopyFrac * 100) / 100,
        impervious: Math.round(impervious * 100) / 100,
        bldg_density: bldgDensity,
        canyon_ar: Math.round(canyonAr * 10) / 10,
        pop_density: popDensity,
        elderly_frac: Math.round(elderlyFrac * 100) / 100,
        poverty_proxy: Math.round(povertyProxy * 100) / 100,
        park_dist: parkDist,
        road_frac: Math.round(roadFrac * 100) / 100,
        shap_lst_mean: Math.round(shapLstMean * 100) / 100,
        shap_poverty_proxy: Math.round(shapPovertyProxy * 100) / 100,
        shap_elderly_frac: Math.round(shapElderlyFrac * 100) / 100,
        shap_ndvi: Math.round(shapNdvi * 100) / 100,
        shap_impervious: Math.round(shapImpervious * 100) / 100,
      },
    };
    features.push(feature);

    // Intervention effects for each block
    const tvsVal = tvs;
    interventionEffects[blockId] = {
      tree_planting: {
        delta_t: Math.round((-0.8 - tvsVal * 1.2 + randomInRange(-0.2, 0.2)) * 10) / 10,
        delta_t_low: Math.round((-1.2 - tvsVal * 1.5 + randomInRange(-0.2, 0)) * 10) / 10,
        delta_t_high: Math.round((-0.4 - tvsVal * 0.8 + randomInRange(0, 0.2)) * 10) / 10,
        cost_lakh: Math.round(12 + randomInRange(-3, 8)),
      },
      cool_pavement: {
        delta_t: Math.round((-0.4 - tvsVal * 0.6 + randomInRange(-0.15, 0.15)) * 10) / 10,
        delta_t_low: Math.round((-0.7 - tvsVal * 0.8 + randomInRange(-0.1, 0)) * 10) / 10,
        delta_t_high: Math.round((-0.2 - tvsVal * 0.4 + randomInRange(0, 0.15)) * 10) / 10,
        cost_lakh: Math.round(25 + randomInRange(-5, 12)),
      },
      green_roof: {
        delta_t: Math.round((-0.3 - tvsVal * 0.5 + randomInRange(-0.1, 0.1)) * 10) / 10,
        delta_t_low: Math.round((-0.5 - tvsVal * 0.7 + randomInRange(-0.1, 0)) * 10) / 10,
        delta_t_high: Math.round((-0.15 - tvsVal * 0.3 + randomInRange(0, 0.1)) * 10) / 10,
        cost_lakh: Math.round(38 + randomInRange(-5, 15)),
      },
      pocket_park: {
        delta_t: Math.round((-0.6 - tvsVal * 0.8 + randomInRange(-0.15, 0.15)) * 10) / 10,
        delta_t_low: Math.round((-0.9 - tvsVal * 1.1 + randomInRange(-0.15, 0)) * 10) / 10,
        delta_t_high: Math.round((-0.3 - tvsVal * 0.5 + randomInRange(0, 0.15)) * 10) / 10,
        cost_lakh: Math.round(22 + randomInRange(-4, 10)),
      },
    };
  }
}

const geojson = {
  type: 'FeatureCollection',
  features,
};

// Generate portfolios for all alpha x budget combinations
const ALPHAS = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const BUDGETS = [0.5, 1.0, 2.0, 3.0, 5.0, 7.0, 10.0, 15.0, 20.0];
const INTERVENTION_TYPES = ['tree_planting', 'cool_pavement', 'green_roof', 'pocket_park'];

const portfolios = {};

for (const alpha of ALPHAS) {
  for (const budget of BUDGETS) {
    const key = `alpha_${alpha.toFixed(1)}_budget_${budget.toFixed(1)}`;
    const budgetLakh = budget * 100;
    
    // Sort blocks by a weighted score combining cooling effectiveness and equity
    const scoredBlocks = features.map(f => {
      const props = f.properties;
      const blockEffects = interventionEffects[props.block_id];
      
      // Find best intervention for this block
      let bestType = 'tree_planting';
      let bestRatio = 0;
      for (const type of INTERVENTION_TYPES) {
        const effect = blockEffects[type];
        const costEfficiency = Math.abs(effect.delta_t) / effect.cost_lakh;
        const equityWeight = alpha * props.poverty_proxy + (1 - alpha) * costEfficiency;
        if (equityWeight > bestRatio) {
          bestRatio = equityWeight;
          bestType = type;
        }
      }
      
      return {
        block_id: props.block_id,
        type: bestType,
        cost_lakh: blockEffects[bestType].cost_lakh,
        delta_t: blockEffects[bestType].delta_t,
        pop_density: props.pop_density,
        poverty_proxy: props.poverty_proxy,
        score: bestRatio,
      };
    }).sort((a, b) => b.score - a.score);

    // Greedy knapsack
    let totalCost = 0;
    let totalDeltaT = 0;
    let totalPeopleProtected = 0;
    const selectedInterventions = [];
    const quartileCounts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

    for (const block of scoredBlocks) {
      if (totalCost + block.cost_lakh > budgetLakh) continue;
      totalCost += block.cost_lakh;
      totalDeltaT += block.delta_t;
      totalPeopleProtected += Math.round(block.pop_density * 0.15);
      selectedInterventions.push({
        block_id: block.block_id,
        type: block.type,
        cost_lakh: block.cost_lakh,
        delta_t: block.delta_t,
      });

      // Assign to income quartile based on poverty proxy
      if (block.poverty_proxy >= 0.75) quartileCounts.Q1++;
      else if (block.poverty_proxy >= 0.5) quartileCounts.Q2++;
      else if (block.poverty_proxy >= 0.25) quartileCounts.Q3++;
      else quartileCounts.Q4++;

      if (selectedInterventions.length >= 80) break; // cap for performance
    }

    const totalInterventions = selectedInterventions.length || 1;
    const avgDeltaT = selectedInterventions.length > 0 ? totalDeltaT / selectedInterventions.length : 0;

    portfolios[key] = {
      total_cost_crore: Math.round(totalCost / 10) / 10,
      total_delta_t: Math.round(avgDeltaT * 10) / 10,
      total_delta_t_uncertainty: Math.round(Math.abs(avgDeltaT) * 0.25 * 10) / 10,
      people_protected: totalPeopleProtected,
      interventions: selectedInterventions,
      equity_quartiles: {
        Q1: Math.round((quartileCounts.Q1 / totalInterventions) * 100) / 100,
        Q2: Math.round((quartileCounts.Q2 / totalInterventions) * 100) / 100,
        Q3: Math.round((quartileCounts.Q3 / totalInterventions) * 100) / 100,
        Q4: Math.round((quartileCounts.Q4 / totalInterventions) * 100) / 100,
      },
    };
  }
}

// Also generate Pareto front data for each budget level
const paretoFronts = {};
for (const budget of BUDGETS) {
  const points = ALPHAS.map(alpha => {
    const key = `alpha_${alpha.toFixed(1)}_budget_${budget.toFixed(1)}`;
    const p = portfolios[key];
    return {
      alpha,
      equity: Math.round((alpha * 0.6 + 0.2 + randomInRange(-0.05, 0.05)) * 100) / 100,
      cooling: Math.round(Math.abs(p.total_delta_t) * (1 + (1 - alpha) * 0.3) * 100) / 100,
      people_protected: p.people_protected,
    };
  });
  paretoFronts[`budget_${budget.toFixed(1)}`] = points;
}

// Write files
writeFileSync(join(DATA_DIR, 'pune_blocks.geojson'), JSON.stringify(geojson));
writeFileSync(join(DATA_DIR, 'intervention_effects.json'), JSON.stringify(interventionEffects));
writeFileSync(join(DATA_DIR, 'portfolios.json'), JSON.stringify(portfolios));
writeFileSync(join(DATA_DIR, 'pareto_fronts.json'), JSON.stringify(paretoFronts));

console.log(`✅ Generated ${features.length} blocks across ${NEIGHBORHOODS.length} neighborhoods`);
console.log(`✅ Generated ${Object.keys(interventionEffects).length} intervention effect entries`);
console.log(`✅ Generated ${Object.keys(portfolios).length} portfolio combinations`);
console.log(`✅ Generated ${Object.keys(paretoFronts).length} Pareto front datasets`);
console.log(`📁 Files written to: ${DATA_DIR}`);
